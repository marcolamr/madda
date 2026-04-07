import { Config, type HashingConfig } from "@madda/core";
import appConfig from "../config/app.js";
import authConfig from "../config/auth.js";
import databaseConfig from "../config/database.js";
import loggingConfig from "../config/logging.js";
import sessionConfig from "../config/session.js";
import translationConfig from "../config/translation.js";

export function createApplicationConfig(options?: {
  hashing?: HashingConfig;
}): Config {
  const data: Record<string, unknown> = {
    app: appConfig,
    auth: authConfig,
    database: databaseConfig,
    logging: loggingConfig,
    session: sessionConfig,
    translation: translationConfig,
  };
  if (options?.hashing !== undefined) {
    data.hashing = options.hashing;
  }
  return new Config(data);
}
