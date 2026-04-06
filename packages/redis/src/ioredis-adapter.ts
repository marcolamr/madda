import type { Redis } from "ioredis";
import type { RedisConnectionContract } from "./redis-connection-contract.js";

export class IoRedisAdapter implements RedisConnectionContract {
  constructor(private readonly redis: Redis) {}

  ping(): Promise<unknown> {
    return this.redis.ping();
  }

  get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  set(key: string, value: string): Promise<unknown> {
    return this.redis.set(key, value);
  }

  setex(key: string, seconds: number, value: string): Promise<unknown> {
    return this.redis.setex(key, seconds, value);
  }

  mget(keys: string[]): Promise<(string | null)[]> {
    return keys.length === 0 ? Promise.resolve([]) : this.redis.mget(...keys);
  }

  del(...keys: string[]): Promise<number> {
    return keys.length === 0 ? Promise.resolve(0) : this.redis.del(...keys);
  }

  keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  flushdb(): Promise<unknown> {
    return this.redis.flushdb();
  }

  quit(): Promise<unknown> {
    return this.redis.quit();
  }

  unwrap(): Redis {
    return this.redis;
  }
}
