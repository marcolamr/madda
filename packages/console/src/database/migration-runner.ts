import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { ConnectionContract, DatabaseManager, Migration } from "@madda/database";

type MigrationFile = { name: string; path: string };

/**
 * Discovers, tracks, and runs database migrations.
 * Mirrors the responsibilities of Laravel's Migrator class.
 *
 * Tracking table: `_migrations` (underscore prefix avoids collisions).
 */
export class MigrationRunner {
  constructor(
    private readonly basePath: string,
    private readonly db: DatabaseManager,
  ) {}

  private get conn(): ConnectionContract {
    return this.db.connection();
  }

  // ------------------------------------------------------------------
  // Public API used by commands
  // ------------------------------------------------------------------

  async run(): Promise<MigrationFile[]> {
    await this.ensureTable();
    const pending = await this.pending();
    if (pending.length === 0) return [];
    const batch = await this.nextBatch();
    for (const file of pending) {
      await this.applyUp(file, batch);
    }
    return pending;
  }

  async rollback(step = 1): Promise<MigrationFile[]> {
    await this.ensureTable();
    const rows = await this.conn.select(
      "SELECT migration, batch FROM _migrations ORDER BY batch DESC, id DESC",
    );
    // collect the last `step` distinct batches
    const batchNums = [...new Set(rows.map((r) => Number(r["batch"])))].slice(0, step);
    const targets = rows.filter((r) => batchNums.includes(Number(r["batch"])));
    if (targets.length === 0) return [];

    const fileMap = await this.fileMap();
    const rolled: MigrationFile[] = [];
    for (const row of targets) {
      const name = String(row["migration"]);
      const file = fileMap.get(name);
      if (file) {
        await this.applyDown(file);
        await this.conn.statement("DELETE FROM _migrations WHERE migration = ?", [name]);
        rolled.push(file);
      }
    }
    return rolled;
  }

  async reset(): Promise<void> {
    await this.ensureTable();
    const rows = await this.conn.select(
      "SELECT migration FROM _migrations ORDER BY id DESC",
    );
    const fileMap = await this.fileMap();
    for (const row of rows) {
      const file = fileMap.get(String(row["migration"]));
      if (file) await this.applyDown(file);
    }
    await this.conn.run("DELETE FROM _migrations");
  }

  async dropAllTables(): Promise<void> {
    if (this.conn.driverName !== "sqlite") {
      throw new Error(
        `migrate:fresh --drop is not implemented for driver "${this.conn.driverName}".`,
      );
    }
    await this.conn.run("PRAGMA foreign_keys = OFF");
    const tables = await this.conn.select(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
    );
    for (const row of tables) {
      await this.conn.run(`DROP TABLE IF EXISTS "${String(row["name"])}"`);
    }
    await this.conn.run("PRAGMA foreign_keys = ON");
  }

  async status(): Promise<{ migration: string; ran: boolean; batch?: number }[]> {
    await this.ensureTable();
    const ranRows = await this.conn.select("SELECT migration, batch FROM _migrations");
    const ranMap = new Map(
      ranRows.map((r) => [String(r["migration"]), Number(r["batch"])]),
    );
    return (await this.files()).map((f) => ({
      migration: f.name,
      ran: ranMap.has(f.name),
      batch: ranMap.get(f.name),
    }));
  }

  async pending(): Promise<MigrationFile[]> {
    const ranRows = await this.conn.select("SELECT migration FROM _migrations");
    const ran = new Set(ranRows.map((r) => String(r["migration"])));
    return (await this.files()).filter((f) => !ran.has(f.name));
  }

  // ------------------------------------------------------------------
  // Internals
  // ------------------------------------------------------------------

  private async applyUp(file: MigrationFile, batch: number): Promise<void> {
    const migration = await this.load(file);
    await migration.up(this.conn);
    await this.conn.statement("INSERT INTO _migrations (migration, batch) VALUES (?, ?)", [
      file.name,
      batch,
    ]);
  }

  private async applyDown(file: MigrationFile): Promise<void> {
    const migration = await this.load(file);
    await migration.down(this.conn);
  }

  private async load(file: MigrationFile): Promise<Migration> {
    const mod = (await import(pathToFileURL(file.path).href)) as Record<string, unknown>;
    const Ctor = mod["default"];
    if (typeof Ctor !== "function") {
      throw new Error(`Migration must export a default class: ${file.path}`);
    }
    return new (Ctor as new () => Migration)();
  }

  private async files(): Promise<MigrationFile[]> {
    const dir = resolve(this.basePath, "database/migrations");
    const entries = await readdir(dir).catch(() => [] as string[]);
    return entries
      .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
      .sort()
      .map((f) => ({ name: f.replace(/\.(ts|js)$/, ""), path: join(dir, f) }));
  }

  private async fileMap(): Promise<Map<string, MigrationFile>> {
    return new Map((await this.files()).map((f) => [f.name, f]));
  }

  private async nextBatch(): Promise<number> {
    const rows = await this.conn.select(
      "SELECT COALESCE(MAX(batch), 0) AS batch FROM _migrations",
    );
    return Number(rows[0]?.["batch"] ?? 0) + 1;
  }

  private async ensureTable(): Promise<void> {
    await this.conn.run(`
      CREATE TABLE IF NOT EXISTS _migrations (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        migration TEXT    NOT NULL UNIQUE,
        batch     INTEGER NOT NULL
      )
    `);
  }
}
