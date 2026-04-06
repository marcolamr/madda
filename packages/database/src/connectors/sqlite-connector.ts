import { DatabaseSync } from "node:sqlite";
import type { ConnectionConfig, SqliteConnectionConfig } from "../config/database-config.js";
import { SqliteConnection } from "../connection/sqlite-connection.js";
import type { ConnectorContract } from "./connector-contract.js";

export class SqliteConnector implements ConnectorContract {
  connect(config: ConnectionConfig): SqliteConnection {
    if (config.driver !== "sqlite") {
      throw new Error(
        `SqliteConnector cannot handle driver "${config.driver}".`,
      );
    }

    const cfg = config as SqliteConnectionConfig;
    const db = new DatabaseSync(cfg.database);

    if (cfg.foreign_key_constraints ?? true) {
      db.exec("PRAGMA foreign_keys = ON");
    }

    if (cfg.busy_timeout != null) {
      db.exec(`PRAGMA busy_timeout = ${cfg.busy_timeout}`);
    }

    if (cfg.journal_mode != null) {
      db.exec(`PRAGMA journal_mode = ${cfg.journal_mode}`);
    }

    if (cfg.synchronous != null) {
      db.exec(`PRAGMA synchronous = ${cfg.synchronous}`);
    }

    return new SqliteConnection(db);
  }
}
