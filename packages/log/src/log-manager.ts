import pino, { type Logger } from "pino";
import {
  buildWritableForChannel,
  buildWritableForChannelNames,
  isSilentDriver,
  levelOf,
} from "./build-destination.js";
import type { LoggingConfig } from "./logging-config.js";

/**
 * Laravel {@link https://github.com/laravel/framework/tree/13.x/src/Illuminate/Log/LogManager.php LogManager}
 * analogue: channel resolution, stacks, and shared context over Pino.
 */
export class LogManager {
  private readonly baseLoggers = new Map<string, Logger>();

  private sharedContext: Record<string, unknown> = {};

  private withContextBag: Record<string, unknown> = {};

  constructor(
    private readonly config: LoggingConfig,
    private readonly basePath?: string,
  ) {}

  /** Configuration tree (same shape as `config/logging.php`). */
  getLoggingConfig(): LoggingConfig {
    return this.config;
  }

  /** Laravel `Log::channel($name)` */
  channel(name: string): Logger {
    const base = this.getOrCreateBaseLogger(name);
    return this.applyContext(base);
  }

  /** Default channel (`logging.default`). */
  driver(): Logger {
    return this.channel(this.config.default);
  }

  /** Laravel `Log::stack([...])` — on-demand multichannel logger. */
  stack(names: string[]): Logger {
    const writable = buildWritableForChannelNames(
      this.config,
      names,
      this.basePath,
    );
    const logger = pino({ level: "trace" as pino.Level }, writable);
    return this.applyContext(logger);
  }

  /**
   * Context merged into subsequent logs (Laravel `Log::withContext`).
   * Use {@link clearWithContext} per request if you reuse one `LogManager`.
   */
  withContext(context: Record<string, unknown>): this {
    this.withContextBag = { ...this.withContextBag, ...context };
    return this;
  }

  clearWithContext(): this {
    this.withContextBag = {};
    return this;
  }

  /**
   * Context shared across all channels, including ones created later
   * (Laravel `Log::shareContext`).
   */
  shareContext(context: Record<string, unknown>): this {
    this.sharedContext = { ...this.sharedContext, ...context };
    return this;
  }

  clearSharedContext(): this {
    this.sharedContext = {};
    return this;
  }

  private applyContext(base: Logger): Logger {
    const merged = { ...this.sharedContext, ...this.withContextBag };
    return Object.keys(merged).length > 0 ? base.child(merged) : base;
  }

  private getOrCreateBaseLogger(name: string): Logger {
    const existing = this.baseLoggers.get(name);
    if (existing) {
      return existing;
    }
    const ch = this.config.channels[name];
    if (!ch) {
      throw new Error(`Unknown log channel "${name}"`);
    }
    if (isSilentDriver(ch)) {
      const silent = pino({ level: "silent" });
      this.baseLoggers.set(name, silent);
      return silent;
    }
    const writable = buildWritableForChannel(
      this.config,
      name,
      0,
      this.basePath,
    );
    const lvl = levelOf(ch, "info") as pino.Level;
    const logger = pino({ level: lvl }, writable);
    this.baseLoggers.set(name, logger);
    return logger;
  }
}
