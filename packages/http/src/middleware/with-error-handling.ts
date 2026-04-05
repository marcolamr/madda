import type { HttpContext } from "../http-message-contract.js";
import type { HttpErrorHandler } from "../http-error-handler-contract.js";
import type { HttpMiddleware } from "../http-middleware-contract.js";
import type { RouteHandler } from "../types.js";
import { composeMiddlewares } from "./compose.js";

/**
 * Wraps middleware chain + handler so failures are passed to `onError`.
 */
export function withErrorHandling(
  middlewares: HttpMiddleware[],
  onError: HttpErrorHandler,
  handler: RouteHandler,
): RouteHandler {
  const inner = composeMiddlewares(middlewares, handler);
  return async (ctx: HttpContext) => {
    try {
      await inner(ctx);
    } catch (error) {
      await onError(error, ctx);
    }
  };
}
