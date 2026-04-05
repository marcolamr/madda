import type { CreateHttpServerOptions, HttpServer } from "./server.js";

/**
 * Contract for the composition root that materializes {@link HttpServer} instances.
 */
export interface HttpServerFactoryContract {
  create(options?: CreateHttpServerOptions): HttpServer;
}
