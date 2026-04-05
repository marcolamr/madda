import Fastify, {
  type FastifyReply,
  type FastifyRequest,
  type FastifyInstance,
} from "fastify";
import type { HttpDriverContract } from "../http-driver-contract.js";
import type { HttpServer } from "../server.js";
import type { HttpContext, HttpReply, HttpRequest } from "../http-message-contract.js";
import type { HttpMethod, RouteHandler } from "../types.js";

function toHttpRequest(req: FastifyRequest): HttpRequest {
  return {
    method: req.method,
    path: req.url.split("?")[0] ?? req.url,
  };
}

function toHttpReply(reply: FastifyReply): HttpReply {
  return {
    status(code: number) {
      reply.status(code);
      return this;
    },
    header(name: string, value: string) {
      void reply.header(name, value);
      return this;
    },
    send(body?: string) {
      void reply.send(body ?? "");
    },
    json(payload: unknown) {
      void reply.send(payload);
    },
  };
}

function wrap(handler: RouteHandler) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const ctx: HttpContext = {
      request: toHttpRequest(req),
      reply: toHttpReply(reply),
    };
    await handler(ctx);
  };
}

function registerMethod(
  app: FastifyInstance,
  method: HttpMethod,
  path: string,
  handler: RouteHandler,
): void {
  app.route({
    method: method.toUpperCase(),
    url: path,
    handler: wrap(handler),
  });
}

export class FastifyHttpServer implements HttpServer {
  private readonly app: FastifyInstance = Fastify({ logger: false });

  route(method: HttpMethod, path: string, handler: RouteHandler): void {
    registerMethod(this.app, method, path, handler);
  }

  get(path: string, handler: RouteHandler): void {
    this.route("get", path, handler);
  }

  post(path: string, handler: RouteHandler): void {
    this.route("post", path, handler);
  }

  put(path: string, handler: RouteHandler): void {
    this.route("put", path, handler);
  }

  patch(path: string, handler: RouteHandler): void {
    this.route("patch", path, handler);
  }

  delete(path: string, handler: RouteHandler): void {
    this.route("delete", path, handler);
  }

  head(path: string, handler: RouteHandler): void {
    this.route("head", path, handler);
  }

  options(path: string, handler: RouteHandler): void {
    this.route("options", path, handler);
  }

  async listen(port: number, host = "0.0.0.0"): Promise<void> {
    await this.app.listen({ port, host });
  }

  close(): Promise<void> {
    return this.app.close();
  }
}

export class FastifyHttpDriver implements HttpDriverContract {
  createServer(): HttpServer {
    return new FastifyHttpServer();
  }
}
