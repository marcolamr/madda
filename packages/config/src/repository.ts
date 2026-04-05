import type { ConfigContract } from "./config-contract.js";
import { getByPath, setByPath } from "./path-utils.js";

export class Config implements ConfigContract {
  constructor(private readonly data: Record<string, unknown>) {}

  get<T = unknown>(key: string, defaultValue?: T): T {
    const v = getByPath(this.data, key);
    if (v === undefined) {
      return defaultValue as T;
    }
    return v as T;
  }

  has(key: string): boolean {
    return getByPath(this.data, key) !== undefined;
  }

  set(key: string, value: unknown): void {
    setByPath(this.data, key, value);
  }

  all(): Readonly<Record<string, unknown>> {
    return this.data;
  }
}
