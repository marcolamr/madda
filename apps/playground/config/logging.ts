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

const logPath = env("LOG_PATH", "./storage/logs/madda.log")!;

/**
 * Laravel `config/logging.php` shape (see {@link https://github.com/laravel/laravel/blob/13.x/config/logging.php}),
 * backed by `@madda/log` / Pino. Relative paths resolve against the app `basePath`.
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
      ignore_exceptions: envBool("LOG_STACK_IGNORE_EXCEPTIONS", false),
      level: env("LOG_LEVEL", "debug"),
      replace_placeholders: true,
    },
    stderr: {
      driver: "stderr",
      level: env("LOG_LEVEL", "debug"),
      replace_placeholders: true,
    },
    stdout: {
      driver: "stdout",
      level: env("LOG_LEVEL", "debug"),
      replace_placeholders: true,
    },
    single: {
      driver: "single",
      path: logPath,
      level: env("LOG_LEVEL", "debug"),
      replace_placeholders: true,
    },
    daily: {
      driver: "daily",
      path: logPath,
      level: env("LOG_LEVEL", "debug"),
      days: Number(env("LOG_DAILY_DAYS", "14")),
      replace_placeholders: true,
    },
    errorlog: {
      driver: "errorlog",
      level: env("LOG_LEVEL", "debug"),
      replace_placeholders: true,
    },
    null: { driver: "null" },
    slack: {
      driver: "slack",
      url: env("LOG_SLACK_WEBHOOK_URL"),
      username: env("LOG_SLACK_USERNAME", "Madda"),
      emoji: env("LOG_SLACK_EMOJI", ":boom:"),
      level: env("LOG_LEVEL", "critical"),
      replace_placeholders: true,
    },
    papertrail: {
      driver: "papertrail",
      host: env("PAPERTRAIL_URL"),
      port: env("PAPERTRAIL_PORT") ? Number(env("PAPERTRAIL_PORT")) : undefined,
      level: env("LOG_LEVEL", "debug"),
      replace_placeholders: true,
    },
    syslog: {
      driver: "syslog",
      level: env("LOG_LEVEL", "debug"),
      facility: env("LOG_SYSLOG_FACILITY"),
      replace_placeholders: true,
    },
    emergency: {
      driver: "emergency",
      path: logPath,
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
