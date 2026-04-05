import type { HttpContext } from "../http-message-contract.js";
import type { HttpErrorHandler } from "../http-error-handler-contract.js";
import { HttpException } from "../http-exception.js";

export function createDefaultErrorHandler(): HttpErrorHandler {
  return async (error: unknown, ctx: HttpContext) => {
    if (error instanceof HttpException) {
      ctx.reply.status(error.statusCode).json(error.body);
      return;
    }

    const err = error instanceof Error ? error : new Error(String(error));
    ctx.log.error(
      { err, method: ctx.request.method, path: ctx.request.path },
      "unhandled_error",
    );

    if (ctx.reply.getStatusCode() >= 400) {
      return;
    }
    ctx.reply.status(500).json({
      message: "Internal Server Error",
      statusCode: 500,
    });
  };
}
