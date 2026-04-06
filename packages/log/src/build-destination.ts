import { chmodSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Writable } from "node:stream";
import pino, { type DestinationStream } from "pino";
import { DailyFileStream } from "./daily-file-stream.js";
import type { LogChannelConfig, LoggingConfig } from "./logging-config.js";
import { resolveLogPath } from "./resolve-path.js";

function noopDestination(): DestinationStream {
  return new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  }) as unknown as DestinationStream;
}

export function levelOf(
  ch: LogChannelConfig | undefined,
  fallback: string,
): string {
  if (ch && "level" in ch && typeof ch.level === "string") {
    return ch.level;
  }
  return fallback;
}

export function isSilentDriver(ch: LogChannelConfig): boolean {
  return ch.driver === "silent" || ch.driver === "null";
}

export function buildWritableForChannel(
  logging: LoggingConfig,
  name: string,
  stackDepth: number,
  basePath?: string,
): DestinationStream {
  if (stackDepth > 24) {
    throw new Error(`Log channel stack depth exceeded while resolving "${name}"`);
  }
  const ch = logging.channels[name];
  if (!ch) {
    throw new Error(`Unknown log channel "${name}"`);
  }

  switch (ch.driver) {
    case "silent":
    case "null":
      return noopDestination();
    case "stdout":
      return process.stdout as unknown as DestinationStream;
    case "stderr":
    case "errorlog":
      return process.stderr as unknown as DestinationStream;
    case "single":
    case "emergency": {
      const rawPath = ch.path;
      const path = resolveLogPath(basePath, rawPath);
      mkdirSync(dirname(path), { recursive: true });
      const dest = pino.destination(path);
      if (
        ch.driver === "single" &&
        "permission" in ch &&
        ch.permission !== undefined
      ) {
        const mode =
          typeof ch.permission === "string"
            ? Number.parseInt(ch.permission, 8)
            : ch.permission;
        try {
          chmodSync(path, mode);
        } catch {
          // best-effort
        }
      }
      return dest;
    }
    case "daily": {
      const path = resolveLogPath(basePath, ch.path);
      return new DailyFileStream(path, ch.permission) as DestinationStream;
    }
    case "stack": {
      const streams = ch.channels.map((subName) => {
        const sub = logging.channels[subName];
        const subLevel = levelOf(sub, levelOf(ch, "debug"));
        return {
          level: subLevel as pino.Level,
          stream: buildWritableForChannel(
            logging,
            subName,
            stackDepth + 1,
            basePath,
          ),
        };
      });
      return pino.multistream(streams) as DestinationStream;
    }
    case "slack":
    case "papertrail":
    case "syslog":
      // Until dedicated transports are wired, mirror Laravel’s “safe default” to stderr.
      return process.stderr as unknown as DestinationStream;
  }
}

/** Build a multistream for an on-demand stack (Laravel `Log::stack([...])`). */
export function buildWritableForChannelNames(
  logging: LoggingConfig,
  names: string[],
  basePath?: string,
): DestinationStream {
  const streams = names.map((subName) => {
    const sub = logging.channels[subName];
    const subLevel = levelOf(sub, "debug");
    return {
      level: subLevel as pino.Level,
      stream: buildWritableForChannel(logging, subName, 0, basePath),
    };
  });
  return pino.multistream(streams) as DestinationStream;
}
