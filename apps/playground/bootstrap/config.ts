import { Config, type HashingConfig } from "@madda/core";
import appConfig from "../config/app.js";
import databaseConfig from "../config/database.js";
import loggingConfig from "../config/logging.js";
import translationConfig from "../config/translation.js";

export function createApplicationConfig(options?: {
  hashing?: HashingConfig;
}): Config {
  const data: Record<string, unknown> = {
    app: appConfig,
    database: databaseConfig,
    logging: loggingConfig,
    translation: translationConfig,
  };
  if (options?.hashing !== undefined) {
    data.hashing = options.hashing;
  }
  return new Config(data);
}
