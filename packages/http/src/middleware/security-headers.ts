import type { HttpMiddleware } from "../http-middleware-contract.js";

export type SecurityHeadersMiddlewareOptions = {
  /**
   * `false` omite o cabeçalho. Por defeito `SAMEORIGIN` (comum em apps web; use `DENY` para APIs puras).
   */
  xFrameOptions?: "DENY" | "SAMEORIGIN" | false;
  /** Por defeito `strict-origin-when-cross-origin`. `false` omite. */
  referrerPolicy?: string | false;
  /** Por defeito envia `X-Content-Type-Options: nosniff`. */
  noSniff?: boolean;
};

/**
 * Cabeçalhos de defesa em profundidade (próximo do que se obtém atrás de Nginx / middleware Laravel).
 * Coloque cedo na cadeia global (`server.use(securityHeadersMiddleware())`).
 */
export function securityHeadersMiddleware(
  options: SecurityHeadersMiddlewareOptions = {},
): HttpMiddleware {
  const xFrame = options.xFrameOptions === undefined ? "SAMEORIGIN" : options.xFrameOptions;
  const refPol =
    options.referrerPolicy === undefined
      ? "strict-origin-when-cross-origin"
      : options.referrerPolicy;
  const noSniff = options.noSniff !== false;

  return async (ctx, next) => {
    if (noSniff) {
      ctx.reply.header("X-Content-Type-Options", "nosniff");
    }
    if (xFrame) {
      ctx.reply.header("X-Frame-Options", xFrame);
    }
    if (refPol) {
      ctx.reply.header("Referrer-Policy", refPol);
    }
    await next();
  };
}
