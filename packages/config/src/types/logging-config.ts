/**
 * Log channel definition (Monolog drivers mapped to Pino-friendly targets; extensible for SaaS).
 * See Laravel `config/logging.php` — {@link https://github.com/laravel/framework/tree/13.x/src/Illuminate/Config Illuminate\Config}.
 */
export type LogChannelConfig =
  | { driver: "silent" | "null" }
  | { driver: "stdout" | "stderr"; level?: string }
  | { driver: "single"; path: string; level?: string }
  | { driver: "stack"; channels: string[]; level?: string }
  | {
      driver: "slack";
      url?: string;
      username?: string;
      emoji?: string;
      level?: string;
    }
  | {
      driver: "papertrail";
      host?: string;
      port?: number;
      level?: string;
    }
  | { driver: "syslog"; level?: string; facility?: string };

export interface LoggingConfig {
  default: string;
  deprecations?: {
    channel: string;
    trace?: boolean;
  };
  channels: Record<string, LogChannelConfig>;
  /**
   * HTTP integration (Madda): access logs and request timing state for handlers/middleware.
   */
  http?: {
    /** Writes `performance.now()` into `ctx.state[stateKey]` at the start of each request. */
    requestTiming?: {
      enabled: boolean;
      /** Default matches previous playground middleware (`startedAt` was used; Laravel-style: explicit key). */
      stateKey?: string;
    };
    /** Structured access line (method, path, status, duration) — Pino. */
    accessLog?: {
      enabled: boolean;
    };
  };
}
