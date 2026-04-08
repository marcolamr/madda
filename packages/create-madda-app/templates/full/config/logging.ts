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
    null: { driver: "null" },
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
