/**
 * Database configuration (Laravel `config/database.php` shape, adapted for Node).
 * See {@link https://github.com/laravel/framework/tree/13.x/src/Illuminate/Database Illuminate\Database}.
 */

export interface SqliteConnectionConfig {
  driver: "sqlite";
  database: string;
  prefix?: string;
  foreign_key_constraints?: boolean;
  busy_timeout?: number | null;
  journal_mode?: string | null;
  synchronous?: string | null;
}

export interface MysqlConnectionConfig {
  driver: "mysql";
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  charset?: string;
  collation?: string;
  prefix?: string;
  strict?: boolean;
}

export interface PostgresConnectionConfig {
  driver: "postgres";
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  charset?: string;
  prefix?: string;
  schema?: string;
  sslmode?: string;
}

export type ConnectionConfig =
  | SqliteConnectionConfig
  | MysqlConnectionConfig
  | PostgresConnectionConfig;

export interface DatabaseConfig {
  /** The name of the default connection key in {@link connections}. */
  default: string;
  connections: Record<string, ConnectionConfig>;
  /**
   * Application root directory. When set, relative SQLite `database` paths
   * (not `:memory:`) are resolved with `path.resolve(basePath, database)` on Node.
   */
  basePath?: string;
}
