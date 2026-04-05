export interface ConfigContract {
  get<T = unknown>(key: string, defaultValue?: T): T;
  has(key: string): boolean;
  set(key: string, value: unknown): void;
  /** Raw merged tree (shallow top-level keys like `app`, `logging`). */
  all(): Readonly<Record<string, unknown>>;
}
