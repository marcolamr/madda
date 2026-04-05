import type { LoggingConfig } from "@madda/core";

const env = (key: string, fallback?: string): string | undefined =>
  process.env[key] ?? fallback;

const envBool = (key: string, fallback: boolean): boolean => {
  const v = process.env[key];
  if (v === undefined) {
    return fallback;
  }
  return v === "1" || v.toLowerCase() === "true";
};

const stackChannels = (env("LOG_STACK", "stderr") ?? "stderr")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Laravel `config/logging.php` shape, implemented with Pino targets.
 * External sinks (Slack, Papertrail, syslog) are stubbed to stderr until transports are wired.
 */
const loggingConfig = {
  default: env("LOG_CHANNEL", "stack")!,
  deprecations: {
    channel: env("LOG_DEPRECATIONS_CHANNEL", "null")!,
    trace: envBool("LOG_DEPRECATIONS_TRACE", false),
  },
  channels: {
    stack: {
      driver: "stack",
      channels: stackChannels.length > 0 ? stackChannels : ["stderr"],
      level: env("LOG_LEVEL", "debug"),
    },
    stderr: { driver: "stderr", level: env("LOG_LEVEL", "debug") },
    stdout: { driver: "stdout", level: env("LOG_LEVEL", "debug") },
    single: {
      driver: "single",
      path: env("LOG_PATH", "./storage/logs/app.log")!,
      level: env("LOG_LEVEL", "debug"),
    },
    null: { driver: "null" },
    slack: {
      driver: "slack",
      url: env("LOG_SLACK_WEBHOOK_URL"),
      username: env("LOG_SLACK_USERNAME", "Madda"),
      emoji: env("LOG_SLACK_EMOJI", ":boom:"),
      level: env("LOG_LEVEL", "critical"),
    },
    papertrail: {
      driver: "papertrail",
      host: env("PAPERTRAIL_URL"),
      port: env("PAPERTRAIL_PORT") ? Number(env("PAPERTRAIL_PORT")) : undefined,
      level: env("LOG_LEVEL", "debug"),
    },
    syslog: {
      driver: "syslog",
      level: env("LOG_LEVEL", "debug"),
      facility: env("LOG_SYSLOG_FACILITY"),
    },
  },
  http: {
    requestTiming: {
      enabled: envBool("LOG_HTTP_REQUEST_TIMING", true),
      stateKey: env("LOG_HTTP_TIMING_STATE_KEY", "requestStartedAt"),
    },
    accessLog: {
      enabled: envBool("LOG_HTTP_ACCESS", true),
    },
  },
} satisfies LoggingConfig;

export default loggingConfig;
