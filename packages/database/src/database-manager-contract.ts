import type { ConnectionContract } from "./connection/connection-contract.js";
import type { QueryBuilder } from "./query/query-builder.js";

/**
 * Central database hub — mirrors Laravel's `DB` facade.
 *
 * Manages named connections and hands out {@link QueryBuilder} instances
 * without exposing any driver detail to callers.
 */
export interface DatabaseManagerContract {
  /**
   * Retrieve (or lazily open) a named connection.
   * Omit `name` to get the default connection.
   */
  connection(name?: string): ConnectionContract;

  /**
   * Start a fluent query against a table on the given (or default) connection.
   *
   * @example
   * ```ts
   * const rows = await db.table('users').where('active', true).get();
   * ```
   */
  table(tableName: string, connection?: string): QueryBuilder;

  /**
   * Wire `Model.setResolver()` so that Active Record models know which
   * connection + grammar to use. Call this once during bootstrap.
   */
  bootModels(): void;
}
