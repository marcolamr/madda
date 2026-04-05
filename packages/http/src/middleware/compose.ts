import type { HttpContext } from "../http-message-contract.js";
import type { HttpMiddleware } from "../http-middleware-contract.js";
import type { RouteHandler } from "../types.js";

/**
 * Run middlewares left-to-right, then the route handler.
 */
export function composeMiddlewares(
  middlewares: HttpMiddleware[],
  handler: RouteHandler,
): RouteHandler {
  return async (ctx: HttpContext) => {
    let index = 0;
    const run = async (): Promise<void> => {
      if (index >= middlewares.length) {
        await handler(ctx);
        return;
      }
      const mw = middlewares[index++]!;
      await mw(ctx, run);
    };
    await run();
  };
}
