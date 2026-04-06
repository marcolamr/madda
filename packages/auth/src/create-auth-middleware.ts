import type { AuthGuardStep } from "@madda/config";
import type { HttpMiddleware } from "@madda/http";
import { HttpException } from "@madda/http";
import { trySessionFromContext } from "@madda/session";
import { AUTH_USER_STATE_KEY, AUTH_VIA_STATE_KEY, DEFAULT_SESSION_USER_KEY } from "./constants.js";
import type { ApiTokenRepository } from "./api-token-repository.js";
import { extractBearerToken } from "./bearer.js";
import { AuthMisconfiguredError } from "./errors.js";
import type { AuthenticatedUser, AuthVia, UserProvider } from "./types.js";

export type CreateAuthMiddlewareOptions = {
  userProvider: UserProvider;
  /**
   * Se `true` (por defeito), tenta resolver o utilizador a partir da sessão
   * (`trySessionFromContext` + id em `sessionUserKey`). Requer middleware de sessão **antes** deste.
   */
  useSession?: boolean;
  /** Repositório de tokens API (`Authorization: Bearer`). */
  tokenRepository?: ApiTokenRepository;
  /** Chave na sessão (por defeito {@link DEFAULT_SESSION_USER_KEY}). */
  sessionUserKey?: string;
  /** Se `true`, não falha quando não há utilizador. */
  optional?: boolean;
  /** Por defeito `['bearer','session']` quando ambos activos; só os passos possíveis são executados. */
  order?: AuthGuardStep[];
};

function defaultOrder(hasBearer: boolean, hasSession: boolean): AuthGuardStep[] {
  if (hasBearer && hasSession) {
    return ["bearer", "session"];
  }
  if (hasBearer) {
    return ["bearer"];
  }
  return ["session"];
}

/**
 * Resolve o utilizador (Bearer e/ou sessão) e preenche `ctx.state` (`madda.auth.user`, `madda.auth.via`).
 */
export function createAuthMiddleware(options: CreateAuthMiddlewareOptions): HttpMiddleware {
  const useSession = options.useSession !== false;
  const hasBearer = options.tokenRepository !== undefined;
  if (!useSession && !hasBearer) {
    throw new AuthMisconfiguredError(
      "createAuthMiddleware: set useSession (default true) and/or tokenRepository",
    );
  }

  const sessionKey = options.sessionUserKey ?? DEFAULT_SESSION_USER_KEY;
  const order =
    options.order ?? defaultOrder(hasBearer, useSession);
  const tokenRepository = options.tokenRepository;

  return async (ctx, next) => {
    let user: AuthenticatedUser | undefined;
    let via: AuthVia | undefined;

    for (const step of order) {
      if (step === "bearer" && hasBearer && tokenRepository) {
        const raw = extractBearerToken(ctx);
        if (raw) {
          const verified = await tokenRepository.verify(raw);
          if (verified) {
            const u = await options.userProvider.loadById(verified.userId);
            if (u) {
              user = u;
              via = "api_token";
              break;
            }
          }
        }
      }

      if (step === "session" && useSession) {
        const session = trySessionFromContext(ctx);
        if (session) {
          const uid = session.get<string>(sessionKey);
          if (uid) {
            const u = await options.userProvider.loadById(uid);
            if (u) {
              user = u;
              via = "session";
              break;
            }
          }
        }
      }
    }

    if (!options.optional && !user) {
      throw new HttpException(401, "Unauthenticated", { message: "Unauthenticated" });
    }

    if (user) {
      ctx.state[AUTH_USER_STATE_KEY] = user;
      ctx.state[AUTH_VIA_STATE_KEY] = via;
    }

    await next();
  };
}

/**
 * Falha com 401 se não existir utilizador no contexto (correr **depois** de {@link createAuthMiddleware} com `optional: true`).
 */
export function requireAuthMiddleware(): HttpMiddleware {
  return async (ctx, next) => {
    const u = ctx.state[AUTH_USER_STATE_KEY];
    if (!u || typeof u !== "object" || typeof (u as AuthenticatedUser).id !== "string") {
      throw new HttpException(401, "Unauthenticated", { message: "Unauthenticated" });
    }
    await next();
  };
}
