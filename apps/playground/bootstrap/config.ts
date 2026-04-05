import { Config } from "@madda/core";
import appConfig from "../config/app.js";
import loggingConfig from "../config/logging.js";

export function createApplicationConfig(): Config {
  return new Config({
    app: appConfig,
    logging: loggingConfig,
  });
}
