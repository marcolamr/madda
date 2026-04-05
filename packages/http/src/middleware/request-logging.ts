import type { HttpMiddleware } from "../http-middleware-contract.js";

/**
 * Next.js-style request log: method, path, status, duration (ms).
 * Expects `ctx.log` to be a request-scoped Pino child (set by the HTTP driver).
 */
export function requestLoggingMiddleware(): HttpMiddleware {
  return async (ctx, next) => {
    const start = performance.now();
    await next();
    const durationMs = Math.round((performance.now() - start) * 1000) / 1000;
    ctx.log.info(
      {
        method: ctx.request.method,
        path: ctx.request.path,
        statusCode: ctx.reply.getStatusCode(),
        durationMs,
      },
      "request",
    );
  };
}
