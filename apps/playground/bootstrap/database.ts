import { DatabaseManager, type DatabaseConfig } from "@madda/database";
import type { ApplicationContract } from "@madda/core";

/** Wire Eloquent-style models to the app database (required for HTTP handlers that use models). */
export function bootstrapDatabase(app: ApplicationContract): void {
  if (!app.config?.has("database")) {
    return;
  }

  const dbConfig = app.config.get<DatabaseConfig>("database");
  const db = new DatabaseManager({
    ...dbConfig,
    basePath: app.basePath,
  });
  db.bootModels();
}
