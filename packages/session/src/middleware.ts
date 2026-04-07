import {
  getCookieHeader,
  parseCookieHeader,
  serializeSetCookie,
  signCookieValue,
  unsignCookieValue,
} from "@madda/cookie";
import type { SerializeCookieOptions } from "@madda/cookie";
import {
  HTTP_BEFORE_SEND_STATE_KEY,
  type HttpBeforeSendCallback,
  type HttpContext,
  type HttpMiddleware,
} from "@madda/http";
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
 * Carrega a sessão antes de `next()` e persiste + `Set-Cookie`:
 * - Regista `commitOnce` em `HTTP_BEFORE_SEND_STATE_KEY`; o driver Fastify corre isso no hook `onSend` (antes do corpo).
 * - No `finally`, só após `next()` **sem** excepção: `await ctx.awaitResponseComplete?.()` e, se ainda não houve commit,
 *   fallback `commitOnce` (ex.: hijack sem `send`).
 *
 * Se `next()` falhar (validação, `HttpException`, …), **não** fazer fallback no `finally` e **retirar** `commitOnce`
 * da fila `HTTP_BEFORE_SEND_STATE_KEY`: persistir sessão no hook `onSend` antes do error handler terminar gerava
 * `ERR_HTTP_HEADERS_SENT` no Fastify. Pedidos que só falham validação raramente precisam de gravar sessão.
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

    let committed = false;
    const commitOnce = async (): Promise<void> => {
      if (committed) {
        return;
      }
      await commitSession(ctx, session, opts);
      committed = true;
    };

    const queue = (ctx.state[HTTP_BEFORE_SEND_STATE_KEY] ??= []) as HttpBeforeSendCallback[];
    queue.push(commitOnce);

    let nextFailed = false;
    try {
      await next();
    } catch (e) {
      nextFailed = true;
      const q = ctx.state[HTTP_BEFORE_SEND_STATE_KEY];
      if (Array.isArray(q)) {
        const rest = q.filter((fn) => fn !== commitOnce);
        if (rest.length === 0) {
          delete ctx.state[HTTP_BEFORE_SEND_STATE_KEY];
        } else {
          ctx.state[HTTP_BEFORE_SEND_STATE_KEY] = rest;
        }
      }
      throw e;
    } finally {
      if (!nextFailed) {
        await ctx.awaitResponseComplete?.();
        if (!committed) {
          await commitOnce();
        }
      }
    }
  };
}
