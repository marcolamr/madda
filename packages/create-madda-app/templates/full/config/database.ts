import type { DatabaseConfig } from "@madda/database";

export default {
  default: process.env["DB_CONNECTION"] ?? "sqlite",
  connections: {
    sqlite: {
      driver: "sqlite",
      database: process.env["DB_DATABASE"] ?? "database/db.sqlite",
      foreign_key_constraints: true,
    },
  },
} satisfies DatabaseConfig;
