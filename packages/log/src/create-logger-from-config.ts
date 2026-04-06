import pino, { type Logger } from "pino";
import { buildWritableForChannel, isSilentDriver, levelOf } from "./build-destination.js";
import type { LoggingConfig } from "./logging-config.js";

export type LoggerFromLoggingResult = {
  logger: Logger;
  requestAccessLog: boolean;
};

export type CreateLoggerFromLoggingOptions = {
  /** Application root for relative `single` / `daily` / `emergency` paths. */
  basePath?: string;
};

/**
 * Root Pino instance for the default channel plus Madda HTTP access-log flags.
 * Mirrors resolving Laravel’s default log channel via {@link https://laravel.com/docs/13.x/logging}.
 */
export function createLoggerAndAccessFlagsFromLoggingConfig(
  logging: LoggingConfig,
  options?: CreateLoggerFromLoggingOptions,
): LoggerFromLoggingResult {
  const basePath = options?.basePath;
  const ch = logging.channels[logging.default];
  if (!ch || isSilentDriver(ch)) {
    return { logger: pino({ level: "silent" }), requestAccessLog: false };
  }

  const writable = buildWritableForChannel(
    logging,
    logging.default,
    0,
    basePath,
  );
  const level = levelOf(ch, "info") as pino.Level;
  const logger = pino({ level }, writable);

  const accessExplicit = logging.http?.accessLog?.enabled;
  const requestAccessLog =
    accessExplicit === true ? true : accessExplicit === false ? false : true;

  return { logger, requestAccessLog };
}
