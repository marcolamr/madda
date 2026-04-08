import type { HttpServer } from "../server.js";
import type { FastifyInstance, InjectOptions } from "fastify";
import type { Response as LightMyRequestResponse } from "light-my-request";

function asFastify(server: HttpServer): FastifyInstance {
  const app = server.nativeApp?.();
  if (!app || typeof (app as FastifyInstance).inject !== "function") {
    throw new Error(
      "injectHttp: HttpServer.nativeApp() must be a FastifyInstance (driver Fastify em @madda/http).",
    );
  }
  return app as FastifyInstance;
}

/**
 * `Fastify.inject` sem expor o driver — usar em testes de integração leves.
 */
export function injectHttp(
  server: HttpServer,
  options: InjectOptions,
): Promise<LightMyRequestResponse> {
  return asFastify(server).inject(options);
}
