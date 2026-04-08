import type { ConnectionContract } from "@madda/database";

/**
 * DDL de referência SQLite; noutros motores ajuste tipos (`BIGSERIAL`, `TEXT`, …).
 */
export const SQLITE_JOBS_QUEUE_TABLE_DDL = `
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  queue TEXT NOT NULL,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
`.trim();
import type { QueueDriver } from "./queue-driver-contract.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function assertSqlIdentifier(name: string, label: string): void {
  if (!/^[\w]+$/.test(name)) {
    throw new Error(`${label} must match /^[\\w]+$/ (got unsafe value)`);
  }
}

/**
 * Fila em tabela SQL genérica (SQLite, Postgres, … via `ConnectionContract` de `@madda/database`).
 * Ver constante {@link SQLITE_JOBS_QUEUE_TABLE_DDL} — timestamps em segundos Unix (inteiro).
 */
export class DatabaseQueueDriver implements QueueDriver {
  constructor(
    private readonly connection: ConnectionContract,
    private readonly table: string,
    private readonly queueName: string,
  ) {
    assertSqlIdentifier(table, "table");
  }

  async push(serializedJob: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    await this.connection.statement(
      `INSERT INTO ${this.table} (queue, payload, attempts, available_at, created_at) VALUES (?, ?, 0, ?, ?)`,
      [this.queueName, serializedJob, now, now],
    );
  }

  async reserve(timeoutSeconds: number): Promise<string | null> {
    if (timeoutSeconds <= 0) {
      return this.reserveOne();
    }
    const deadline = Date.now() + timeoutSeconds * 1000;
    let next: string | null;
    while ((next = await this.reserveOne()) === null) {
      if (Date.now() >= deadline) {
        return null;
      }
      const left = deadline - Date.now();
      await sleep(Math.min(250, Math.max(1, left)));
    }
    return next;
  }

  private async reserveOne(): Promise<string | null> {
    return this.connection.transaction(async (c) => {
      const rows = await c.select(
        `SELECT id, payload FROM ${this.table} WHERE queue = ? AND available_at <= ? ORDER BY id ASC LIMIT 1`,
        [this.queueName, Math.floor(Date.now() / 1000)],
      );
      const row = rows[0];
      if (!row || row.id === undefined || row.payload === undefined) {
        return null;
      }
      await c.statement(`DELETE FROM ${this.table} WHERE id = ?`, [row.id]);
      return String(row.payload);
    });
  }
}
