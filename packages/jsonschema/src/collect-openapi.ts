import {
  HTTP_CONTROLLER_PREFIX_METADATA,
  HTTP_METHOD_METADATA,
  HTTP_PATH_METADATA,
  HTTP_ROUTE_JSON_SCHEMA_METADATA,
} from "@madda/reflection";
import type { HttpRouteJsonSchema } from "./types.js";
import {
  openApiOperationFromSchema,
  toOpenApiPathTemplate,
  type OpenApiDocument31,
} from "./openapi.js";

type HttpMethodLower =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "head"
  | "options";

function listInstanceMethodKeys(Ctor: abstract new (...args: unknown[]) => object): string[] {
  const keys = new Set<string>();
  let proto: object | null = Ctor.prototype;
  while (proto && proto !== Object.prototype) {
    for (const key of Object.getOwnPropertyNames(proto)) {
      if (key === "constructor") {
        continue;
      }
      keys.add(key);
    }
    proto = Object.getPrototypeOf(proto);
  }
  return [...keys];
}

function joinPaths(...parts: string[]): string {
  const cleaned = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .filter((p) => p.length > 0);
  if (cleaned.length === 0) {
    return "/";
  }
  return "/" + cleaned.join("/");
}

export type DiscoveredControllerRoute = {
  method: HttpMethodLower;
  path: string;
  schema?: HttpRouteJsonSchema;
  handlerKey: string;
};

/**
 * Lista rotas descobertas pelos mesmos metadados que `registerController` usa.
 */
export function discoverControllerRoutes(
  ControllerClass: abstract new (...args: unknown[]) => object,
): DiscoveredControllerRoute[] {
  const prefix =
    (Reflect.getMetadata(HTTP_CONTROLLER_PREFIX_METADATA, ControllerClass) as string | undefined) ??
    "";
  const out: DiscoveredControllerRoute[] = [];

  for (const key of listInstanceMethodKeys(ControllerClass)) {
    const method = Reflect.getMetadata(
      HTTP_METHOD_METADATA,
      ControllerClass,
      key,
    ) as HttpMethodLower | undefined;
    if (!method) {
      continue;
    }
    const pathMeta =
      (Reflect.getMetadata(HTTP_PATH_METADATA, ControllerClass, key) as string | undefined) ?? "";
    const schema = Reflect.getMetadata(
      HTTP_ROUTE_JSON_SCHEMA_METADATA,
      ControllerClass,
      key,
    ) as HttpRouteJsonSchema | undefined;
    const routePath = joinPaths(prefix, pathMeta);
    out.push({ method, path: routePath, schema, handlerKey: key });
  }

  return out;
}

export type BuildOpenApiDocumentOptions = {
  info: { title: string; version: string; description?: string };
  /** Prefixo global (ex. servidor montado em `/v1`). */
  pathPrefix?: string;
  tagsFromController?: (ControllerClass: abstract new () => object) => string[] | undefined;
};

/**
 * Agrega vários controllers num documento OpenAPI 3.1 (`paths`).
 */
export function buildOpenApiDocument(
  controllers: Array<abstract new (...args: unknown[]) => object>,
  options: BuildOpenApiDocumentOptions,
): OpenApiDocument31 {
  const paths: Record<string, Record<string, unknown>> = {};
  const prefix = options.pathPrefix?.replace(/\/$/, "") ?? "";

  for (const ControllerClass of controllers) {
    const tag =
      options.tagsFromController?.(ControllerClass) ??
      [ControllerClass.name.replace(/Controller$/, "") || "api"];
    const routes = discoverControllerRoutes(ControllerClass);

    for (const route of routes) {
      const full = prefix ? joinPaths(prefix, route.path.replace(/^\//, "")) : route.path;
      const openApiPath = toOpenApiPathTemplate(full);
      if (!paths[openApiPath]) {
        paths[openApiPath] = {};
      }
      const operationId = `${ControllerClass.name}.${route.handlerKey}`;
      const op = openApiOperationFromSchema(route.schema ?? {}, {
        operationId,
        tags: tag,
        summary: `${route.method.toUpperCase()} ${openApiPath}`,
      });
      paths[openApiPath]![route.method] = op;
    }
  }

  return {
    openapi: "3.1.0",
    info: options.info,
    paths,
  };
}
