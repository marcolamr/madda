import type { HttpErrorHandler } from "./http-error-handler-contract.js";
import type { HttpMiddleware } from "./http-middleware-contract.js";
import type { Logger } from "pino";
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
  /** Global middleware (runs for every route; append order = execution order). */
  use(middleware: HttpMiddleware): void;

  setErrorHandler(handler: HttpErrorHandler): void;

  listen(port: number, host?: string): Promise<void>;
  close(): Promise<void>;

  /**
   * Instância do framework quando existir (ex.: `FastifyInstance`) — plugins como WebSocket.
   * Só implementado pelo driver Fastify em `@madda/http`.
   */
  nativeApp?(): unknown;
}

export type HttpDriverKind = "fastify";

export type CreateHttpServerOptions = {
  driver?: HttpDriverKind;
  /**
   * Root Pino logger for `ctx.log`. When `true`, a default `info` logger is used.
   */
  logger?: Logger | boolean;
  /**
   * When false, skips structured HTTP access logging (method, path, status, duration).
   */
  requestAccessLog?: boolean;
  /**
   * Runs before access logging and other globals (e.g. framework request timing).
   */
  prependGlobalMiddleware?: HttpMiddleware[];
};
