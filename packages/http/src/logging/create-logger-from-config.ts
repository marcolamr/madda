import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Writable } from "node:stream";
import pino, { type DestinationStream, type Logger } from "pino";
import type { LogChannelConfig, LoggingConfig } from "@madda/config";

function noopDestination(): DestinationStream {
  return new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  }) as unknown as DestinationStream;
}

function levelOf(ch: LogChannelConfig | undefined, fallback: string): string {
  if (ch && "level" in ch && typeof ch.level === "string") {
    return ch.level;
  }
  return fallback;
}

function isSilentDriver(ch: LogChannelConfig): boolean {
  return ch.driver === "silent" || ch.driver === "null";
}

function buildWritableForChannel(
  logging: LoggingConfig,
  name: string,
  stackDepth: number,
): DestinationStream {
  if (stackDepth > 24) {
    throw new Error(`Log channel stack depth exceeded while resolving "${name}"`);
  }
  const ch = logging.channels[name];
  if (!ch) {
    throw new Error(`Unknown log channel "${name}"`);
  }

  if (isSilentDriver(ch)) {
    return noopDestination();
  }

  switch (ch.driver) {
    case "stdout":
      return process.stdout as unknown as DestinationStream;
    case "stderr":
      return process.stderr as unknown as DestinationStream;
    case "single": {
      const dir = dirname(ch.path);
      mkdirSync(dir, { recursive: true });
      return pino.destination(ch.path);
    }
    case "stack": {
      const level = (levelOf(ch, "info") as pino.Level) ?? "info";
      return pino.multistream(
        ch.channels.map((subName) => ({
          level,
          stream: buildWritableForChannel(logging, subName, stackDepth + 1),
        })),
      ) as DestinationStream;
    }
    case "slack":
    case "papertrail":
    case "syslog":
      // Placeholder until dedicated transports (e.g. pino-slack-webhook) are added.
      return process.stderr as unknown as DestinationStream;
  }

  throw new Error(`Unsupported log driver`);
}

export type LoggerFromLoggingResult = {
  logger: Logger;
  requestAccessLog: boolean;
};

/**
 * Builds the root Pino instance for the default channel and derives HTTP access-log behaviour.
 */
export function createLoggerAndAccessFlagsFromLoggingConfig(
  logging: LoggingConfig,
): LoggerFromLoggingResult {
  const ch = logging.channels[logging.default];
  if (!ch || isSilentDriver(ch)) {
    return { logger: pino({ level: "silent" }), requestAccessLog: false };
  }

  const writable = buildWritableForChannel(logging, logging.default, 0);
  const level = levelOf(ch, "info") as pino.Level;
  const logger = pino({ level }, writable);

  const accessExplicit = logging.http?.accessLog?.enabled;
  const requestAccessLog =
    accessExplicit === true ? true : accessExplicit === false ? false : true;

  return { logger, requestAccessLog };
}
