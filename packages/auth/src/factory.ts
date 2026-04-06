import type { AuthConfigShape } from "@madda/config";
import type { ConfigContract } from "@madda/config";
import { DEFAULT_SESSION_USER_KEY } from "./constants.js";
import type { ApiTokenRepository } from "./api-token-repository.js";
import { createAuthMiddleware, type CreateAuthMiddlewareOptions } from "./create-auth-middleware.js";
export type CreateAuthMiddlewareFromConfigOptions = Omit<
  CreateAuthMiddlewareOptions,
  "sessionUserKey" | "order"
> & {
  tokenRepository?: ApiTokenRepository;
};

/**
 * Lê `auth.session.user_key` e `auth.guard_order` do config quando existirem.
 */
export function createAuthMiddlewareFromConfig(
  config: ConfigContract,
  options: CreateAuthMiddlewareFromConfigOptions,
): ReturnType<typeof createAuthMiddleware> {
  const authCfg = (config.get("auth", {}) as Partial<AuthConfigShape>) ?? {};
  const sessionUserKey = authCfg.session?.user_key ?? DEFAULT_SESSION_USER_KEY;
  const order = authCfg.guard_order;

  return createAuthMiddleware({
    ...options,
    sessionUserKey,
    ...(order !== undefined ? { order } : {}),
  });
}
