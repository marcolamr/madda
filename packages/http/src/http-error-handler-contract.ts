import type { HttpContext } from "./http-message-contract.js";

export type HttpErrorHandler = (error: unknown, ctx: HttpContext) => void | Promise<void>;
