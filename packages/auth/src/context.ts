import type { HttpContext } from "@madda/http";
import { HttpException } from "@madda/http";
import { AUTH_USER_STATE_KEY, AUTH_VIA_STATE_KEY } from "./constants.js";
import type { AuthenticatedUser, AuthVia } from "./types.js";

export function authUser(ctx: HttpContext): AuthenticatedUser | undefined {
  const u = ctx.state[AUTH_USER_STATE_KEY];
  if (!u || typeof u !== "object" || typeof (u as AuthenticatedUser).id !== "string") {
    return undefined;
  }
  return u as AuthenticatedUser;
}

export function authVia(ctx: HttpContext): AuthVia | undefined {
  const v = ctx.state[AUTH_VIA_STATE_KEY];
  return v === "session" || v === "api_token" ? v : undefined;
}

export function requireAuthUser(ctx: HttpContext): AuthenticatedUser {
  const u = authUser(ctx);
  if (!u) {
    throw new HttpException(401, "Unauthenticated", { message: "Unauthenticated" });
  }
  return u;
}
