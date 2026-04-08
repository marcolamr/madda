import type { ConfigContract, LoggingConfig } from "@madda/config";
import { createLoggerAndAccessFlagsFromLoggingConfig } from "@madda/log";
import {
  requestTimingMiddleware,
  type CreateHttpServerOptions,
  type HttpMiddleware,
} from "@madda/http";

export function mergeCreateHttpServerOptions(
  base: CreateHttpServerOptions,
  override: CreateHttpServerOptions,
): CreateHttpServerOptions {
  return {
    ...base,
    ...override,
    driver: override.driver ?? base.driver,
    logger: override.logger !== undefined ? override.logger : base.logger,
    requestAccessLog:
      override.requestAccessLog !== undefined
        ? override.requestAccessLog
        : base.requestAccessLog,
    trustProxy:
      override.trustProxy !== undefined ? override.trustProxy : base.trustProxy,
    bodyLimit:
      override.bodyLimit !== undefined ? override.bodyLimit : base.bodyLimit,
    prependGlobalMiddleware: [
      ...(base.prependGlobalMiddleware ?? []),
      ...(override.prependGlobalMiddleware ?? []),
    ],
  };
}

export function buildCreateHttpServerOptionsFromConfig(
  config: ConfigContract,
  basePath?: string,
): CreateHttpServerOptions {
  if (!config.has("logging")) {
    return {};
  }
  const logging = config.get<LoggingConfig>("logging");
  const { logger, requestAccessLog } =
    createLoggerAndAccessFlagsFromLoggingConfig(logging, { basePath });

  const prepend: HttpMiddleware[] = [];
  const timing = logging.http?.requestTiming;
  if (timing?.enabled) {
    prepend.push(
      requestTimingMiddleware({
        stateKey: timing.stateKey ?? "requestStartedAt",
      }),
    );
  }

  return {
    logger,
    requestAccessLog,
    prependGlobalMiddleware: prepend,
  };
}
