import { Grammar } from "./grammar.js";

/**
 * SQLite-specific grammar.
 *
 * SQLite uses double-quoted identifiers (already the base default).
 * Add overrides here as SQLite deviates from standard SQL.
 */
export class SqliteGrammar extends Grammar {
  // SQLite-specific deviations go here.
  // Example: SQLite does not support ADD COLUMN with constraints in ALTER TABLE —
  // override compileAlterTable() when schema builder is added.
}
