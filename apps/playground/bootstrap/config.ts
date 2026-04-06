import { Config, type HashingConfig } from "@madda/core";
import appConfig from "../config/app.js";
import databaseConfig from "../config/database.js";
import loggingConfig from "../config/logging.js";

export function createApplicationConfig(options?: {
  hashing?: HashingConfig;
}): Config {
  const data: Record<string, unknown> = {
    app: appConfig,
    database: databaseConfig,
    logging: loggingConfig,
  };
  if (options?.hashing !== undefined) {
    data.hashing = options.hashing;
  }
  return new Config(data);
}
