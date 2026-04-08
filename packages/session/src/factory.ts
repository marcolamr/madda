import path from "node:path";
import type { ConfigContract, SessionConfigShape, SessionStoreConfigShape } from "@madda/config";
import type { SerializeCookieOptions } from "@madda/cookie";
import { parseAppKey } from "@madda/encryption";
import type { HttpMiddleware } from "@madda/http";
import { redisConnectionFromConfig } from "@madda/redis";
import type { RedisConnectionContract } from "@madda/redis";
import { SessionStoreMisconfiguredError } from "./errors.js";
import { FileSessionStore } from "./file-session-store.js";
import { createSessionMiddleware } from "./middleware.js";
import { RedisSessionStore } from "./redis-session-store.js";
import type { SessionStore } from "./session-store-contract.js";

const DEFAULT_SESSION_PATH = path.join("storage", "framework", "sessions");

function defaultStores(): Record<string, SessionStoreConfigShape> {
  return {
    file: {
      driver: "file",
      path: path.join(process.cwd(), DEFAULT_SESSION_PATH),
      lifetime: 7200,
    },
  };
}

function mergeSessionStores(
  sessionCfg: Partial<SessionConfigShape>,
): Record<string, SessionStoreConfigShape> {
  const merged: Record<string, SessionStoreConfigShape> = {
    ...defaultStores(),
    ...(sessionCfg.stores ?? {}),
  };
  if (merged.file?.driver === "file" && !merged.file.path) {
    merged.file = {
      ...merged.file,
      path: path.join(process.cwd(), DEFAULT_SESSION_PATH),
    };
  }
  return merged;
}

function mapSameSite(
  s: SessionConfigShape["same_site"] | undefined,
): SerializeCookieOptions["sameSite"] {
  if (!s) {
    return undefined;
  }
  const u = s.toLowerCase();
  if (u === "lax") {
    return "Lax";
  }
  if (u === "strict") {
    return "Strict";
  }
  if (u === "none") {
    return "None";
  }
  return undefined;
}

/** Alinhado a Laravel `SESSION_SECURE_COOKIE` + `APP_ENV=production`. */
function isProductionLike(config: ConfigContract): boolean {
  const appEnv = config.get("app.env", "") as string;
  const fromConfig = (appEnv || "").toLowerCase();
  if (fromConfig === "production" || fromConfig === "prod") {
    return true;
  }
  const node = (process.env.NODE_ENV || "").toLowerCase();
  return node === "production";
}

function buildStore(
  name: string,
  cfg: SessionStoreConfigShape,
  config: ConfigContract,
  redisOverrides: Record<string, RedisConnectionContract> | undefined,
): SessionStore {
  switch (cfg.driver) {
    case "file": {
      const p = cfg.path;
      if (!p) {
        throw new SessionStoreMisconfiguredError(
          name,
          'driver "file" requires `path` (or set session.stores.file.path in config).',
        );
      }
      return new FileSessionStore(p);
    }
    case "redis": {
      const connName = cfg.connection ?? "default";
      const redis =
        redisOverrides?.[connName] ??
        redisConnectionFromConfig((k, d) => config.get(k, d), connName);
      return new RedisSessionStore(redis, `madda:session:${name}:`);
    }
    default:
      throw new SessionStoreMisconfiguredError(
        name,
        `unknown driver "${(cfg as SessionStoreConfigShape).driver}"`,
      );
  }
}

/**
 * Loja de sessão activa conforme `session.driver` e `session.stores`.
 */
export function createSessionStoreFromConfig(
  config: ConfigContract,
  redisOverrides?: Record<string, RedisConnectionContract>,
): SessionStore {
  const sessionCfg = (config.get("session", {}) as Partial<SessionConfigShape>) ?? {};
  const driverName = sessionCfg.driver ?? "file";
  const mergedStores = mergeSessionStores(sessionCfg);
  const storeCfg = mergedStores[driverName];
  if (!storeCfg) {
    throw new SessionStoreMisconfiguredError(
      driverName,
      "unknown session store name (check session.driver / session.stores).",
    );
  }
  return buildStore(driverName, storeCfg, config, redisOverrides);
}

/**
 * TTL em segundos: `session.lifetime` ou `lifetime` da loja activa, ou 7200.
 */
export function sessionLifetimeFromConfig(config: ConfigContract): number {
  const sessionCfg = (config.get("session", {}) as Partial<SessionConfigShape>) ?? {};
  const driverName = sessionCfg.driver ?? "file";
  const mergedStores = mergeSessionStores(sessionCfg);
  const storeCfg = mergedStores[driverName];
  const fromStore = storeCfg?.lifetime;
  const root = sessionCfg.lifetime;
  return root ?? fromStore ?? 7200;
}

/**
 * Middleware de sessão usando `session.*`, `app.key` e opcionalmente ligações Redis injectadas.
 */
export function createSessionMiddlewareFromConfig(
  config: ConfigContract,
  options?: { redis?: Record<string, RedisConnectionContract> },
): HttpMiddleware {
  const store = createSessionStoreFromConfig(config, options?.redis);
  const appKey = config.get("app.key", "") as string;
  const secret = parseAppKey(appKey);
  const lifetime = sessionLifetimeFromConfig(config);
  const sessionCfg = (config.get("session", {}) as Partial<SessionConfigShape>) ?? {};
  const cookieName = sessionCfg.cookie ?? "madda_session";
  const sameSite = mapSameSite(sessionCfg.same_site);
  let secure = sessionCfg.secure;
  if (sameSite === "None") {
    secure = true;
  } else if (secure === undefined && isProductionLike(config)) {
    secure = true;
  }
  const cookie: SerializeCookieOptions = {
    path: sessionCfg.path ?? "/",
    domain: sessionCfg.domain,
    secure,
    httpOnly: sessionCfg.http_only ?? true,
    sameSite,
    maxAge: lifetime,
  };
  return createSessionMiddleware({
    store,
    secret,
    cookieName,
    lifetimeSeconds: lifetime,
    cookie,
  });
}
