import type { HttpContext } from "./http-message-contract.js";

export type NextFunction = () => void | Promise<void>;

/**
 * Connect-style middleware executed before the route handler (NestJS / Express pattern).
 */
export type HttpMiddleware = (ctx: HttpContext, next: NextFunction) => void | Promise<void>;
