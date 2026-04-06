import {
  getCookieHeader,
  parseCookieHeader,
  serializeSetCookie,
  signCookieValue,
  unsignCookieValue,
} from "@madda/cookie";
import type { SerializeCookieOptions } from "@madda/cookie";
import type { HttpContext, HttpMiddleware } from "@madda/http";
import { SESSION_STATE_KEY } from "./constants.js";
import type { SessionStore } from "./session-store-contract.js";
import { Session, randomSessionId } from "./session.js";

export type SessionMiddlewareOptions = {
  store: SessionStore;
  /** Segredo para assinar o ID da sessão no cookie (típico: bytes de `APP_KEY`). */
  secret: Buffer;
  cookieName?: string;
  lifetimeSeconds?: number;
  cookie?: SerializeCookieOptions;
};

async function commitSession(
  ctx: HttpContext,
  session: Session,
  opts: SessionMiddlewareOptions,
): Promise<void> {
  const cookieName = opts.cookieName ?? "madda_session";
  const lifetime = opts.lifetimeSeconds ?? 7200;
  const prev = session.takeReplacedSessionId();
  if (prev) {
    await opts.store.destroy(prev);
  }
  await opts.store.write(session.id, session.toStore(), lifetime);
  const signed = signCookieValue(opts.secret, session.id);
  const base: SerializeCookieOptions = {
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    maxAge: lifetime,
    ...opts.cookie,
  };
  ctx.reply.appendCookieLine(serializeSetCookie(cookieName, signed, base));
}

/**
 * Carrega a sessão antes de `next()` e persiste + envia `Set-Cookie` no `finally`
 * (comportamento próximo ao ciclo de vida do Laravel).
 */
export function createSessionMiddleware(opts: SessionMiddlewareOptions): HttpMiddleware {
  return async (ctx, next) => {
    const cookieName = opts.cookieName ?? "madda_session";
    const cookieHeader = getCookieHeader(ctx.request);
    const cookies = parseCookieHeader(cookieHeader ?? "");
    const rawSigned = cookies[cookieName];
    let sessionId = randomSessionId();
    let stored = null;
    if (rawSigned) {
      const unsigned = unsignCookieValue(opts.secret, rawSigned);
      if (unsigned) {
        sessionId = unsigned;
        stored = await opts.store.read(sessionId);
      }
    }
    const session = Session.fromStore(sessionId, stored);
    ctx.state[SESSION_STATE_KEY] = session;
    try {
      await next();
    } finally {
      await commitSession(ctx, session, opts);
    }
  };
}
