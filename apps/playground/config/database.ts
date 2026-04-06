import type { DatabaseConfig } from "@madda/database";

/**
 * Database configuration — mirrors `config/database.php` from Laravel.
 * See {@link https://github.com/laravel/framework/tree/13.x/src/Illuminate/Database Illuminate\Database}.
 */
export default {
  /*
  |--------------------------------------------------------------------------
  | Default Database Connection Name
  |--------------------------------------------------------------------------
  |
  | The connection used unless another is specified explicitly.
  |
  */
  default: process.env["DB_CONNECTION"] ?? "sqlite",

  /*
  |--------------------------------------------------------------------------
  | Database Connections
  |--------------------------------------------------------------------------
  */
  connections: {
    sqlite: {
      driver: "sqlite",
      database: process.env["DB_DATABASE"] ?? "database/db.sqlite",
      foreign_key_constraints: true,
    },

    mysql: {
      driver: "mysql",
      host: process.env["DB_HOST"] ?? "127.0.0.1",
      port: Number(process.env["DB_PORT"] ?? 3306),
      database: process.env["DB_DATABASE"] ?? "madda",
      username: process.env["DB_USERNAME"] ?? "root",
      password: process.env["DB_PASSWORD"] ?? "",
      charset: "utf8mb4",
      collation: "utf8mb4_unicode_ci",
      strict: true,
    },

    postgres: {
      driver: "postgres",
      host: process.env["DB_HOST"] ?? "127.0.0.1",
      port: Number(process.env["DB_PORT"] ?? 5432),
      database: process.env["DB_DATABASE"] ?? "madda",
      username: process.env["DB_USERNAME"] ?? "postgres",
      password: process.env["DB_PASSWORD"] ?? "",
      charset: "utf8",
      schema: "public",
      sslmode: "prefer",
    },
  },
} satisfies DatabaseConfig;
