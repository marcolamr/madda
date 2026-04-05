import type { HttpContext } from "./http-message-contract.js";

export type RouteHandler = (ctx: HttpContext) => void | Promise<void>;

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete" | "head" | "options";
