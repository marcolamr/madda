import { DatabaseSync } from "node:sqlite";
import type { ConnectionContract, RawRow, RunResult } from "./connection-contract.js";
import { Connection } from "./connection.js";

/**
 * SQLite connection backed by the built-in `node:sqlite` module (Node ≥ 22.5).
 *
 * `DatabaseSync` operations are synchronous; they are wrapped in
 * `Promise.resolve()` so the surface matches the async {@link ConnectionContract}
 * that future drivers (MySQL, Postgres) will fulfil natively.
 */
export class SqliteConnection extends Connection {
  readonly driverName = "sqlite" as const;

  constructor(private readonly db: DatabaseSync) {
    super();
  }

  select(sql: string, bindings: unknown[] = []): Promise<RawRow[]> {
    // node:sqlite expects SQLInputValue[]; our contract uses unknown[] for driver-agnosticism.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = this.db.prepare(sql).all(...(bindings as any[])) as RawRow[];
    return Promise.resolve(rows);
  }

  statement(sql: string, bindings: unknown[] = []): Promise<RunResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const info = this.db.prepare(sql).run(...(bindings as any[])) as {
      lastInsertRowid: number | bigint;
      changes: number;
    };
    return Promise.resolve({
      lastInsertRowid: info.lastInsertRowid,
      changes: info.changes,
    });
  }

  run(sql: string): Promise<void> {
    this.db.exec(sql);
    return Promise.resolve();
  }

  /**
   * Manual BEGIN / COMMIT / ROLLBACK transaction.
   *
   * We cannot use a synchronous transaction wrapper because our contract
   * is async-first. Since all SQLite operations resolve immediately, this is safe.
   */
  transaction<T>(
    callback: (connection: ConnectionContract) => Promise<T>,
  ): Promise<T> {
    this.db.exec("BEGIN");

    return callback(this).then(
      (result) => {
        this.db.exec("COMMIT");
        return result;
      },
      (err: unknown) => {
        this.db.exec("ROLLBACK");
        throw err;
      },
    );
  }
}
