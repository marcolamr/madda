import type { HttpMiddleware } from "../http-middleware-contract.js";

export type RequestTimingMiddlewareOptions = {
  /** Key on `ctx.state` (dot paths not supported — single segment). */
  stateKey?: string;
};

/**
 * Embeddable request timing: stores `performance.now()` on `ctx.state` for handlers / controllers.
 * Enable/disable via application logging config (`logging.http.requestTiming`), not per-route boilerplate.
 */
export function requestTimingMiddleware(
  options?: RequestTimingMiddlewareOptions,
): HttpMiddleware {
  const stateKey = options?.stateKey ?? "requestStartedAt";
  return async (ctx, next) => {
    ctx.state[stateKey] = performance.now();
    await next();
  };
}
