import "reflect-metadata";
import type { HttpContext } from "./http-message-contract.js";
import type { HttpMiddleware } from "./http-middleware-contract.js";
import type { HttpMethod } from "./types.js";
import { joinPaths } from "./path-utils.js";
import type { RouteRegistrar } from "./server.js";
import { composeMiddlewares } from "./middleware/compose.js";
import {
  HTTP_CONTROLLER_PREFIX_METADATA,
  HTTP_METHOD_METADATA,
  HTTP_METHOD_USE_MIDDLEWARE_METADATA,
  HTTP_PATH_METADATA,
  HTTP_USE_MIDDLEWARE_METADATA,
} from "./decorators/metadata-keys.js";

export type RegisterControllerOptions = {
  /** If omitted, `new Controller()` is used. */
  instance?: object;
};

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

/**
 * Registers decorated controller methods on a {@link RouteRegistrar} (NestJS-style).
 */
export function registerController<T extends abstract new (...args: unknown[]) => object>(
  registrar: RouteRegistrar,
  ControllerClass: T,
  options?: RegisterControllerOptions,
): InstanceType<T> {
  const prefix =
    (Reflect.getMetadata(HTTP_CONTROLLER_PREFIX_METADATA, ControllerClass) as string | undefined) ??
    "";
  const controllerMiddleware =
    (Reflect.getMetadata(HTTP_USE_MIDDLEWARE_METADATA, ControllerClass) as
      | HttpMiddleware[]
      | undefined) ?? [];

  const Ctor = ControllerClass as unknown as new () => InstanceType<T>;
  const instance = (options?.instance ?? new Ctor()) as InstanceType<T>;

  for (const key of listInstanceMethodKeys(ControllerClass)) {
    const method = Reflect.getMetadata(
      HTTP_METHOD_METADATA,
      ControllerClass,
      key,
    ) as HttpMethod | undefined;
    if (!method) {
      continue;
    }
    const pathMeta =
      (Reflect.getMetadata(HTTP_PATH_METADATA, ControllerClass, key) as string | undefined) ?? "";
    const methodMiddleware =
      (Reflect.getMetadata(
        HTTP_METHOD_USE_MIDDLEWARE_METADATA,
        ControllerClass,
        key,
      ) as HttpMiddleware[] | undefined) ?? [];

    const routePath = joinPaths(prefix, pathMeta);
    const handlerFn = (instance as Record<string, unknown>)[key];
    if (typeof handlerFn !== "function") {
      continue;
    }

    const bound = handlerFn.bind(instance) as (ctx: HttpContext) => void | Promise<void>;
    const routeHandler = async (ctx: HttpContext) => {
      await bound(ctx);
    };

    const chain = [...controllerMiddleware, ...methodMiddleware];
    const finalHandler =
      chain.length > 0 ? composeMiddlewares(chain, routeHandler) : routeHandler;

    registrar.route(method, routePath, finalHandler);
  }

  return instance;
}
