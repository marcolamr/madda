import type { CacheRepository } from "../cache-repository.js";

type Entry = { exp: number | null; val: unknown };

export class ArrayCacheStore implements CacheRepository {
  private readonly data = new Map<string, Entry>();

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const e = this.data.get(key);
    if (!e) {
      return undefined;
    }
    if (e.exp !== null && Date.now() / 1000 >= e.exp) {
      this.data.delete(key);
      return undefined;
    }
    return e.val as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const exp =
      ttlSeconds === undefined ? null : Math.floor(Date.now() / 1000) + ttlSeconds;
    this.data.set(key, { exp, val: value });
  }

  async forever(key: string, value: unknown): Promise<void> {
    this.data.set(key, { exp: null, val: value });
  }

  async forget(key: string): Promise<boolean> {
    return this.data.delete(key);
  }

  async flush(): Promise<void> {
    this.data.clear();
  }

  async flushPrefix(prefix: string): Promise<void> {
    for (const k of [...this.data.keys()]) {
      if (k.startsWith(prefix)) {
        this.data.delete(k);
      }
    }
  }

  async remember<T>(
    key: string,
    ttlSeconds: number,
    callback: () => T | Promise<T>,
  ): Promise<T> {
    const cur = await this.get<T>(key);
    if (cur !== undefined) {
      return cur;
    }
    const v = await callback();
    await this.set(key, v, ttlSeconds);
    return v;
  }

  async many(keys: string[]): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    for (const k of keys) {
      const v = await this.get(k);
      if (v !== undefined) {
        out[k] = v;
      }
    }
    return out;
  }

  async putMany(entries: Record<string, unknown>, ttlSeconds?: number): Promise<void> {
    for (const [k, v] of Object.entries(entries)) {
      await this.set(k, v, ttlSeconds);
    }
  }
}
