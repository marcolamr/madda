import type { CreateHttpServerOptions, HttpServer } from "./server.js";

export interface HttpDriverContract {
  createServer(options?: CreateHttpServerOptions): HttpServer;
}
