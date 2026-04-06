export type RawRow = Record<string, unknown>;

export interface RunResult {
  lastInsertRowid: number | bigint;
  changes: number;
}

/**
 * Driver-agnostic database connection.
 *
 * Concrete implementations translate these primitives to the underlying engine
 * (SQLite, MySQL, Postgres …) without exposing any driver details upward.
 */
export interface ConnectionContract {
  /** The driver name this connection is backed by ('sqlite' | 'mysql' | 'postgres'). */
  readonly driverName: string;

  /** Execute a SELECT-like query and return every matching row. */
  select(sql: string, bindings?: unknown[]): Promise<RawRow[]>;

  /** Execute an INSERT / UPDATE / DELETE and return metadata. */
  statement(sql: string, bindings?: unknown[]): Promise<RunResult>;

  /** Execute arbitrary DDL or a fire-and-forget SQL string. */
  run(sql: string): Promise<void>;

  /** Wrap a unit of work in a database transaction. */
  transaction<T>(
    callback: (connection: ConnectionContract) => Promise<T>,
  ): Promise<T>;
}
