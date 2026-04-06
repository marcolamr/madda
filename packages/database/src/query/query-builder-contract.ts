import type { RawRow } from "../connection/connection-contract.js";

/**
 * Fluent query builder contract — the only SQL-facing surface models use.
 *
 * Every method that adds a constraint returns `this` for chaining.
 * Terminal methods (`get`, `first`, `insert`, …) are always async.
 */
export interface QueryBuilderContract {
  select(...columns: string[]): this;

  where(column: string, value: unknown): this;
  where(column: string, operator: string, value: unknown): this;

  orWhere(column: string, value: unknown): this;
  orWhere(column: string, operator: string, value: unknown): this;

  whereNull(column: string): this;
  whereNotNull(column: string): this;
  whereIn(column: string, values: unknown[]): this;
  whereBetween(column: string, values: [unknown, unknown]): this;
  whereRaw(sql: string): this;

  orderBy(column: string, direction?: "asc" | "desc"): this;
  orderByDesc(column: string): this;

  limit(value: number): this;
  offset(value: number): this;

  /** Fetch all matching rows. */
  get(): Promise<RawRow[]>;

  /** Fetch the first matching row, or `null`. */
  first(): Promise<RawRow | null>;

  /** Shorthand for `where('id', id).first()`. */
  find(id: number | string): Promise<RawRow | null>;

  /** Insert a row and return the new primary key. */
  insert(values: Record<string, unknown>): Promise<number | bigint>;

  /** Update matching rows and return the number of affected rows. */
  update(values: Record<string, unknown>): Promise<number>;

  /** Delete matching rows and return the number of affected rows. */
  delete(): Promise<number>;

  /** Return the count of matching rows. */
  count(): Promise<number>;
}
