import type { HttpMethod, RouteHandler } from "./types.js";

/**
 * Contract for registering routes (framework-facing API; no driver details).
 */
export type RouteRegistrar = {
  [K in HttpMethod]: (path: string, handler: RouteHandler) => void;
} & {
  route(method: HttpMethod, path: string, handler: RouteHandler): void;
};

/**
 * Contract for the HTTP runtime used by the application kernel.
 */
export interface HttpServer extends RouteRegistrar {
  listen(port: number, host?: string): Promise<void>;
  close(): Promise<void>;
}

export type HttpDriverKind = "fastify";

export type CreateHttpServerOptions = {
  driver?: HttpDriverKind;
};
