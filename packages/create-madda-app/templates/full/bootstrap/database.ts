import type { ApplicationContract } from "@madda/core";
import { DatabaseManager, type DatabaseConfig } from "@madda/database";

let appDatabase: DatabaseManager | undefined;

export function getAppDatabase(): DatabaseManager | undefined {
  return appDatabase;
}

export function bootstrapDatabase(app: ApplicationContract): void {
  if (!app.config?.has("database")) {
    appDatabase = undefined;
    return;
  }

  const dbConfig = app.config.get<DatabaseConfig>("database");
  const db = new DatabaseManager({
    ...dbConfig,
    basePath: app.basePath,
  });
  db.bootModels();
  appDatabase = db;
}
