import type { RedisConnectionContract } from "@madda/redis";
import type { CacheRepository } from "../cache-repository.js";
import { decodeValue, encodeValue } from "../serialize.js";

/**
 * Cache em Redis. `flush` apaga só chaves com `keyPrefix` (via KEYS — evitar em instâncias enormes).
 */
export class RedisCacheStore implements CacheRepository {
  constructor(
    private readonly redis: RedisConnectionContract,
    private readonly keyPrefix: string,
  ) {}

  private k(key: string): string {
    return `${this.keyPrefix}${key}`;
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const raw = await this.redis.get(this.k(key));
    if (raw === null) {
      return undefined;
    }
    try {
      return decodeValue<T>(raw);
    } catch {
      return undefined;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const payload = encodeValue(value);
    if (ttlSeconds === undefined) {
      await this.redis.set(this.k(key), payload);
    } else {
      await this.redis.setex(this.k(key), ttlSeconds, payload);
    }
  }

  async forever(key: string, value: unknown): Promise<void> {
    await this.redis.set(this.k(key), encodeValue(value));
  }

  async forget(key: string): Promise<boolean> {
    const n = await this.redis.del(this.k(key));
    return n > 0;
  }

  async flush(): Promise<void> {
    const keys = await this.redis.keys(`${this.keyPrefix}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async flushPrefix(prefix: string): Promise<void> {
    const full = `${this.keyPrefix}${prefix}`;
    const keys = await this.redis.keys(`${full}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
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
    if (keys.length === 0) {
      return {};
    }
    const full = keys.map((key) => this.k(key));
    const vals = await this.redis.mget(full);
    const out: Record<string, unknown> = {};
    keys.forEach((key, i) => {
      const raw = vals[i];
      if (raw === null || raw === undefined) {
        return;
      }
      try {
        out[key] = decodeValue(raw);
      } catch {
        /* skip corrupt */
      }
    });
    return out;
  }

  async putMany(entries: Record<string, unknown>, ttlSeconds?: number): Promise<void> {
    for (const [key, value] of Object.entries(entries)) {
      await this.set(key, value, ttlSeconds);
    }
  }
}
