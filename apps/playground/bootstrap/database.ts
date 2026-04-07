import { DatabaseManager, type DatabaseConfig } from "@madda/database";
import type { ApplicationContract } from "@madda/core";

let playgroundDb: DatabaseManager | undefined;

/** Instância do `DatabaseManager` do playground após `bootstrapDatabase`, se existir config `database`. */
export function getPlaygroundDatabase(): DatabaseManager | undefined {
  return playgroundDb;
}

/** Wire Eloquent-style models to the app database (required for HTTP handlers that use models). */
export function bootstrapDatabase(app: ApplicationContract): void {
  if (!app.config?.has("database")) {
    playgroundDb = undefined;
    return;
  }

  const dbConfig = app.config.get<DatabaseConfig>("database");
  const db = new DatabaseManager({
    ...dbConfig,
    basePath: app.basePath,
  });
  db.bootModels();
  playgroundDb = db;
}
