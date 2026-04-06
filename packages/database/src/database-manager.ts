import type { ConnectionConfig, DatabaseConfig } from "./config/database-config.js";
import type { ConnectionContract } from "./connection/connection-contract.js";
import { SqliteConnector } from "./connectors/sqlite-connector.js";
import type { ConnectorContract } from "./connectors/connector-contract.js";
import { Grammar } from "./grammar/grammar.js";
import { SqliteGrammar } from "./grammar/sqlite-grammar.js";
import { Model } from "./model/model.js";
import { QueryBuilder } from "./query/query-builder.js";
import type { DatabaseManagerContract } from "./database-manager-contract.js";

/**
 * Manages multiple named database connections and acts as the composition
 * root for the database layer.
 *
 * Connections are opened lazily on first use and reused thereafter.
 *
 * @example
 * ```ts
 * const db = new DatabaseManager({
 *   default: 'sqlite',
 *   connections: {
 *     sqlite: { driver: 'sqlite', database: ':memory:' },
 *   },
 * });
 *
 * db.bootModels(); // wire Eloquent-style models
 *
 * const rows = await db.table('users').where('active', true).get();
 * ```
 */
export class DatabaseManager implements DatabaseManagerContract {
  private readonly open = new Map<string, ConnectionContract>();

  constructor(private readonly config: DatabaseConfig) {}

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  connection(name?: string): ConnectionContract {
    const key = name ?? this.config.default;

    const cached = this.open.get(key);
    if (cached) return cached;

    const connectionConfig = this.config.connections[key];
    if (!connectionConfig) {
      throw new Error(
        `Database connection "${key}" is not configured. ` +
          `Available: ${Object.keys(this.config.connections).join(", ")}.`,
      );
    }

    const connection = this.makeConnection(connectionConfig);
    this.open.set(key, connection);
    return connection;
  }

  table(tableName: string, connectionName?: string): QueryBuilder {
    const conn = this.connection(connectionName);
    const grammar = this.makeGrammar(conn.driverName);
    return new QueryBuilder(conn, grammar, tableName);
  }

  /**
   * Register a resolver on {@link Model} so that Active Record models can
   * resolve their connection + grammar without importing the manager directly.
   *
   * Call once during application bootstrap, before the first model query.
   */
  bootModels(): void {
    Model.setResolver((connectionName?: string) => {
      const conn = this.connection(connectionName);
      const grammar = this.makeGrammar(conn.driverName);
      return [conn, grammar];
    });
  }

  // ------------------------------------------------------------------
  // Driver registry
  // ------------------------------------------------------------------

  /** Return the connector for the given driver. Override to add drivers. */
  protected resolveConnector(driver: string): ConnectorContract {
    switch (driver) {
      case "sqlite":
        return new SqliteConnector();
      default:
        throw new Error(
          `Unsupported database driver "${driver}". ` +
            `Extend DatabaseManager.resolveConnector() to add new drivers.`,
        );
    }
  }

  /** Return the grammar for the given driver name. Override to customise. */
  protected makeGrammar(driver: string): Grammar {
    switch (driver) {
      case "sqlite":
        return new SqliteGrammar();
      default:
        return new Grammar();
    }
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private makeConnection(config: ConnectionConfig): ConnectionContract {
    return this.resolveConnector(config.driver).connect(config);
  }
}
