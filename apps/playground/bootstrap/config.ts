import { Config } from "@madda/core";
import appConfig from "../config/app.js";
import databaseConfig from "../config/database.js";
import loggingConfig from "../config/logging.js";

export function createApplicationConfig(): Config {
  return new Config({
    app: appConfig,
    database: databaseConfig,
    logging: loggingConfig,
  });
}
