/** Dot-notation object wrapper — same role as Laravel `Illuminate\Support\Fluent`. */
export class Fluent<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  constructor(protected attributes: T) {}

  get<K extends keyof T>(key: K): T[K] | undefined;
  get<K extends keyof T>(key: K, defaultValue: NonNullable<T[K]>): NonNullable<T[K]>;
  get(key: string, defaultValue?: unknown): unknown;
  get(key: string, defaultValue?: unknown): unknown {
    if (Object.prototype.hasOwnProperty.call(this.attributes, key)) {
      return this.attributes[key as keyof T];
    }
    return defaultValue;
  }

  set<K extends keyof T>(key: K, value: T[K]): this;
  set(key: string, value: unknown): this;
  set(key: string, value: unknown): this {
    (this.attributes as Record<string, unknown>)[key] = value;
    return this;
  }

  fill(values: Partial<T>): this {
    Object.assign(this.attributes, values);
    return this;
  }

  has(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this.attributes, key);
  }

  only<K extends keyof T>(keys: K[]): Pick<T, K> {
    const out = {} as Pick<T, K>;
    for (const k of keys) {
      if (this.has(String(k))) {
        out[k] = this.attributes[k];
      }
    }
    return out;
  }

  except<K extends keyof T>(keys: K[]): Omit<T, K> {
    const skip = new Set(keys.map(String));
    const out = { ...this.attributes } as Record<string, unknown>;
    for (const k of skip) {
      delete out[k];
    }
    return out as Omit<T, K>;
  }

  toJSON(): T {
    return { ...this.attributes };
  }
}
