import type { HttpDriverContract } from "./http-driver-contract.js";
import type { HttpServerFactoryContract } from "./http-server-factory-contract.js";
import { FastifyHttpDriver } from "./drivers/fastify-driver.js";
import type { CreateHttpServerOptions, HttpDriverKind, HttpServer } from "./server.js";

const drivers: Record<HttpDriverKind, HttpDriverContract> = {
  fastify: new FastifyHttpDriver(),
};

export class DefaultHttpServerFactory implements HttpServerFactoryContract {
  create(options: CreateHttpServerOptions = {}): HttpServer {
    const kind: HttpDriverKind = options.driver ?? "fastify";
    return drivers[kind].createServer(options);
  }
}

const defaultHttpServerFactory = new DefaultHttpServerFactory();

export function createHttpServer(options?: CreateHttpServerOptions): HttpServer {
  return defaultHttpServerFactory.create(options);
}
