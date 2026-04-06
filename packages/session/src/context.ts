import type { HttpContext } from "@madda/http";
import { SESSION_STATE_KEY } from "./constants.js";
import { Session } from "./session.js";

export function sessionFromContext(ctx: HttpContext): Session {
  const s = ctx.state[SESSION_STATE_KEY];
  if (!s || !(s instanceof Session)) {
    throw new Error("Session middleware is not registered on this application.");
  }
  return s;
}

export function trySessionFromContext(ctx: HttpContext): Session | undefined {
  const s = ctx.state[SESSION_STATE_KEY];
  return s instanceof Session ? s : undefined;
}
