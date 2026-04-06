import path from "node:path";
import type { CacheStoreConfigShape, ConfigContract } from "@madda/config";
import { redisConnectionFromConfig } from "@madda/redis";
import type { RedisConnectionContract } from "@madda/redis";
import type { CacheRepository } from "./cache-repository.js";
import { CacheManager } from "./cache-manager.js";
import { CacheStoreMisconfiguredError } from "./errors.js";
import { withKeyPrefix } from "./prefixed-cache.js";
import { ArrayCacheStore } from "./stores/array-cache-store.js";
import { FileCacheStore } from "./stores/file-cache-store.js";
import { RedisCacheStore } from "./stores/redis-cache-store.js";

const DEFAULT_FILE_PATH = path.join("storage", "framework", "cache", "data");

/** Madda: loja por defeito = ficheiro (Laravel costuma usar `file` também). */
export const DEFAULT_CACHE_STORE = "file";

function defaultStores(): Record<string, CacheStoreConfigShape> {
  return {
    file: {
      driver: "file",
      path: path.join(process.cwd(), DEFAULT_FILE_PATH),
    },
    array: { driver: "array" },
  };
}

function buildStore(
  name: string,
  cfg: CacheStoreConfigShape,
  config: ConfigContract,
  redisOverrides: Record<string, RedisConnectionContract> | undefined,
): CacheRepository {
  let base: CacheRepository;
  switch (cfg.driver) {
    case "array":
      base = new ArrayCacheStore();
      break;
    case "file": {
      const p = cfg.path;
      if (!p) {
        throw new CacheStoreMisconfiguredError(
          name,
          'driver "file" requires `path` (or set cache.stores.file.path in config).',
        );
      }
      base = new FileCacheStore(p);
      break;
    }
    case "redis": {
      const connName = cfg.connection ?? "default";
      const redis =
        redisOverrides?.[connName] ??
        redisConnectionFromConfig((k, d) => config.get(k, d), connName);
      const keyPrefix = `madda:cache:${name}:`;
      base = new RedisCacheStore(redis, keyPrefix);
      break;
    }
    default:
      throw new CacheStoreMisconfiguredError(
        name,
        `unknown driver "${(cfg as CacheStoreConfigShape).driver}"`,
      );
  }
  return withKeyPrefix(base, cfg.prefix);
}

/**
 * Constrói um `CacheManager` a partir de `config` (`cache.default`, `cache.stores`).
 * Se não existir config, usa loja `file` em `storage/framework/cache/data` relativo ao cwd.
 */
export function createCacheManagerFromConfig(
  config: ConfigContract,
  options?: { redis?: Record<string, RedisConnectionContract> },
): CacheManager {
  const defaultName = (config.get("cache.default", DEFAULT_CACHE_STORE) as string) ?? DEFAULT_CACHE_STORE;
  const mergedStores: Record<string, CacheStoreConfigShape> = {
    ...defaultStores(),
    ...((config.get("cache.stores", {}) as Record<string, CacheStoreConfigShape>) ?? {}),
  };

  if (mergedStores.file && mergedStores.file.driver === "file" && !mergedStores.file.path) {
    mergedStores.file = {
      ...mergedStores.file,
      path: path.join(process.cwd(), DEFAULT_FILE_PATH),
    };
  }

  const map = new Map<string, CacheRepository>();
  for (const [name, storeCfg] of Object.entries(mergedStores)) {
    map.set(name, buildStore(name, storeCfg, config, options?.redis));
  }

  return new CacheManager(defaultName, map);
}
