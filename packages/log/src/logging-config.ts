/**
 * Laravel `config/logging.php` shape, adapted for Node (Pino targets).
 * @see {@link https://github.com/laravel/laravel/blob/13.x/config/logging.php}
 * @see {@link https://laravel.com/docs/13.x/logging}
 */
export type LogChannelConfig =
  | { driver: "silent" }
  | { driver: "null" }
  | {
      driver: "stdout" | "stderr";
      level?: string;
      /** Laravel: Monolog placeholder replacement — reserved for future use. */
      replace_placeholders?: boolean;
    }
  | {
      driver: "single";
      path: string;
      level?: string;
      bubble?: boolean;
      locking?: boolean;
      permission?: string | number;
      replace_placeholders?: boolean;
    }
  | {
      driver: "daily";
      path: string;
      level?: string;
      /** Retention hint (days); optional pruning on rotation when implemented. */
      days?: number;
      bubble?: boolean;
      locking?: boolean;
      permission?: string | number;
      replace_placeholders?: boolean;
    }
  | {
      driver: "stack";
      channels: string[];
      ignore_exceptions?: boolean;
      name?: string;
      level?: string;
      replace_placeholders?: boolean;
    }
  | {
      driver: "errorlog";
      level?: string;
      replace_placeholders?: boolean;
    }
  /** Laravel emergency channel (path-only fallback when config is broken). */
  | { driver: "emergency"; path: string }
  | {
      driver: "slack";
      url?: string;
      username?: string;
      emoji?: string;
      level?: string;
      replace_placeholders?: boolean;
    }
  | {
      driver: "papertrail";
      host?: string;
      port?: number;
      level?: string;
      replace_placeholders?: boolean;
    }
  | {
      driver: "syslog";
      level?: string;
      facility?: string;
      replace_placeholders?: boolean;
    };

export interface LoggingConfig {
  default: string;
  deprecations?: {
    channel: string;
    trace?: boolean;
  };
  channels: Record<string, LogChannelConfig>;
  /**
   * Madda HTTP integration: access logs and request timing (not in Laravel core file).
   */
  http?: {
    requestTiming?: {
      enabled: boolean;
      stateKey?: string;
    };
    accessLog?: {
      enabled: boolean;
    };
  };
}
