import { randomUUID } from "node:crypto";
import type { ServerResponse } from "node:http";
import Fastify, {
  type FastifyReply,
  type FastifyRequest,
  type FastifyInstance,
} from "fastify";
import pino, { type Logger } from "pino";
import type { HttpDriverContract } from "../http-driver-contract.js";
import type { HttpErrorHandler } from "../http-error-handler-contract.js";
import type { HttpMiddleware } from "../http-middleware-contract.js";
import type { HttpContext, HttpReply, HttpRequest } from "../http-message-contract.js";
import { createDefaultErrorHandler } from "../middleware/default-error-handler.js";
import { requestLoggingMiddleware } from "../middleware/request-logging.js";
import { withErrorHandling } from "../middleware/with-error-handling.js";
import type { CreateHttpServerOptions, HttpServer } from "../server.js";
import type { HttpMethod, RouteHandler } from "../types.js";

function toHttpRequest(req: FastifyRequest): HttpRequest {
  const path = req.url.split("?")[0] ?? req.url;
  const query: Record<string, string | undefined> = {};
  const raw = req.query as Record<string, unknown> | undefined;
  if (raw && typeof raw === "object") {
    for (const [key, value] of Object.entries(raw)) {
      if (Array.isArray(value)) {
        query[key] =
          value[0] === undefined ? undefined : String(value[0]);
      } else if (value === undefined || value === null) {
        query[key] = undefined;
      } else {
        query[key] = String(value);
      }
    }
  }
  const headers: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of Object.entries(req.headers)) {
    headers[k] = v;
  }
  const params: Record<string, string> = {};
  const rawParams = req.params as Record<string, unknown> | undefined;
  if (rawParams && typeof rawParams === "object") {
    for (const [k, v] of Object.entries(rawParams)) {
      if (v !== undefined && v !== null) {
        params[k] = String(v);
      }
    }
  }

  return {
    method: req.method,
    path,
    query,
    params,
    body: req.body,
    headers,
    driverRequest: req,
  };
}

function createHttpReply(reply: FastifyReply): HttpReply {
  let explicitStatus = 200;
  return {
    driverReply: reply,
    status(code: number) {
      explicitStatus = code;
      reply.status(code);
      return this;
    },
    header(name: string, value: string) {
      void reply.header(name, value);
      return this;
    },
    appendCookieLine(line: string) {
      const raw = reply.raw as ServerResponse & {
        appendHeader?: (n: string, v: string) => void;
      };
      if (typeof raw.appendHeader === "function") {
        raw.appendHeader("Set-Cookie", line);
      } else {
        void reply.header("Set-Cookie", line);
      }
      return this;
    },
    send(body?: string) {
      void reply.send(body ?? "");
    },
    json(payload: unknown) {
      void reply.send(payload);
    },
    getStatusCode(): number {
      return reply.statusCode || explicitStatus;
    },
  };
}

export class FastifyHttpServer implements HttpServer {
  private readonly app: FastifyInstance = Fastify({ logger: false });
  private readonly rootLogger: Logger;
  private readonly globalMiddleware: HttpMiddleware[] = [];
  private errorHandler: HttpErrorHandler = createDefaultErrorHandler();

  constructor(options?: CreateHttpServerOptions) {
    const prepend = options?.prependGlobalMiddleware ?? [];
    for (const mw of prepend) {
      this.globalMiddleware.push(mw);
    }

    const logOpt = options?.logger;
    const wantAccessLog = options?.requestAccessLog !== false;

    if (logOpt === true) {
      this.rootLogger = pino({ level: "info" });
      if (wantAccessLog) {
        this.globalMiddleware.push(requestLoggingMiddleware());
      }
    } else if (typeof logOpt === "object" && logOpt !== null) {
      this.rootLogger = logOpt;
      if (wantAccessLog) {
        this.globalMiddleware.push(requestLoggingMiddleware());
      }
    } else {
      this.rootLogger = pino({ level: "silent" });
    }
  }

  use(middleware: HttpMiddleware): void {
    this.globalMiddleware.push(middleware);
  }

  setErrorHandler(handler: HttpErrorHandler): void {
    this.errorHandler = handler;
  }

  private buildContext(req: FastifyRequest, reply: FastifyReply): HttpContext {
    const state: Record<string, unknown> = {};
    const log = this.rootLogger.child({
      reqId: randomUUID(),
      method: req.method,
      path: req.url.split("?")[0] ?? req.url,
    });
    return {
      request: toHttpRequest(req),
      reply: createHttpReply(reply),
      log,
      state,
    };
  }

  private wrap(handler: RouteHandler) {
    const pipeline = withErrorHandling(
      [...this.globalMiddleware],
      this.errorHandler,
      handler,
    );
    return async (req: FastifyRequest, reply: FastifyReply) => {
      const ctx = this.buildContext(req, reply);
      await pipeline(ctx);
    };
  }

  route(method: HttpMethod, path: string, handler: RouteHandler): void {
    this.app.route({
      method: method.toUpperCase(),
      url: path,
      handler: this.wrap(handler),
    });
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

  nativeApp(): unknown {
    return this.app;
  }
}

export class FastifyHttpDriver implements HttpDriverContract {
  createServer(options?: CreateHttpServerOptions): HttpServer {
    return new FastifyHttpServer(options);
  }
}
