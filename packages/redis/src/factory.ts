import type { RedisConnectionConfig } from "@madda/config";
import { Redis } from "ioredis";
import { IoRedisAdapter } from "./ioredis-adapter.js";
import type { RedisConnectionContract } from "./redis-connection-contract.js";

/**
 * Cliente ioredis (lazy connect). O adapter expõe `RedisConnectionContract`.
 */
export function createIoRedis(config: RedisConnectionConfig): Redis {
  if (config.url) {
    return new Redis(config.url, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
    });
  }
  return new Redis({
    host: config.host ?? "127.0.0.1",
    port: config.port ?? 6379,
    password: config.password,
    db: config.db ?? 0,
    tls: config.tls ? {} : undefined,
    lazyConnect: true,
    maxRetriesPerRequest: null,
  });
}

export function createRedisAdapter(config: RedisConnectionConfig): IoRedisAdapter {
  return new IoRedisAdapter(createIoRedis(config));
}

/** Ligação nomeada a partir do objeto de config (chaves `redis.default` + `redis.connections`). */
export function redisConnectionFromConfig(
  get: (key: string, defaultValue?: unknown) => unknown,
  name?: string,
): RedisConnectionContract {
  const defaultName = (get("redis.default", "default") as string) ?? "default";
  const connName = name ?? defaultName;
  const connections = (get("redis.connections", {}) as Record<string, RedisConnectionConfig>) ?? {};
  const cfg = connections[connName];
  if (!cfg) {
    throw new Error(`Redis connection "${connName}" is not defined in config.`);
  }
  return createRedisAdapter(cfg);
}
