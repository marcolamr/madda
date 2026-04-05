import type { HttpMiddleware } from "./http-middleware-contract.js";
import { joinPaths } from "./path-utils.js";
import type { RouteRegistrar } from "./server.js";
import type { HttpMethod, RouteHandler } from "./types.js";
import { composeMiddlewares } from "./middleware/compose.js";

export type GroupOptions = {
  prefix: string;
  middleware?: HttpMiddleware | HttpMiddleware[];
};

type Segment = { prefix: string; middlewares: HttpMiddleware[] };

function normalizeMiddlewares(m: GroupOptions["middleware"]): HttpMiddleware[] {
  if (m === undefined) {
    return [];
  }
  return Array.isArray(m) ? m : [m];
}

function stripSlashes(s: string): string {
  return s.replace(/^\/+|\/+$/g, "");
}

/**
 * Laravel-style router: route groups with `prefix` and shared `middleware`.
 */
export class HttpRouter implements RouteRegistrar {
  private readonly registrar: RouteRegistrar;
  private readonly segments: Segment[];

  constructor(registrar: RouteRegistrar, segments?: Segment[]) {
    this.registrar = registrar;
    this.segments = segments ?? [{ prefix: "", middlewares: [] }];
  }

  group(options: GroupOptions, fn: (router: HttpRouter) => void): void {
    const child = new HttpRouter(this.registrar, [
      ...this.segments,
      {
        prefix: stripSlashes(options.prefix),
        middlewares: normalizeMiddlewares(options.middleware),
      },
    ]);
    fn(child);
  }

  private fullPrefix(): string {
    const parts = this.segments.map((s) => s.prefix).filter((p) => p.length > 0);
    if (parts.length === 0) {
      return "";
    }
    return joinPaths(...parts);
  }

  private collectMiddlewares(): HttpMiddleware[] {
    return this.segments.flatMap((s) => s.middlewares);
  }

  private register(method: HttpMethod, path: string, handler: RouteHandler): void {
    const base = this.fullPrefix();
    const fullPath = base ? joinPaths(base, path) : joinPaths("/", path);
    const mws = this.collectMiddlewares();
    const finalHandler =
      mws.length > 0 ? composeMiddlewares(mws, handler) : handler;
    this.registrar.route(method, fullPath, finalHandler);
  }

  route(method: HttpMethod, path: string, handler: RouteHandler): void {
    this.register(method, path, handler);
  }

  get(path: string, handler: RouteHandler): void {
    this.register("get", path, handler);
  }

  post(path: string, handler: RouteHandler): void {
    this.register("post", path, handler);
  }

  put(path: string, handler: RouteHandler): void {
    this.register("put", path, handler);
  }

  patch(path: string, handler: RouteHandler): void {
    this.register("patch", path, handler);
  }

  delete(path: string, handler: RouteHandler): void {
    this.register("delete", path, handler);
  }

  head(path: string, handler: RouteHandler): void {
    this.register("head", path, handler);
  }

  options(path: string, handler: RouteHandler): void {
    this.register("options", path, handler);
  }
}
