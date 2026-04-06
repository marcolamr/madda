import {
  HTTP_CONTROLLER_PREFIX_METADATA,
  HTTP_METHOD_USE_MIDDLEWARE_METADATA,
  HTTP_USE_MIDDLEWARE_METADATA,
} from "@madda/reflection";
import type { HttpMiddleware } from "../http-middleware-contract.js";

export function Controller(prefix = ""): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(HTTP_CONTROLLER_PREFIX_METADATA, prefix, target);
  };
}

export function UseMiddleware(
  ...middlewares: HttpMiddleware[]
): ClassDecorator & MethodDecorator {
  return ((target: object, propertyKey?: string | symbol) => {
    if (propertyKey === undefined) {
      const Ctor = target as new (...args: unknown[]) => unknown;
      const cur =
        (Reflect.getMetadata(HTTP_USE_MIDDLEWARE_METADATA, Ctor) as HttpMiddleware[] | undefined) ??
        [];
      Reflect.defineMetadata(HTTP_USE_MIDDLEWARE_METADATA, [...cur, ...middlewares], Ctor);
    } else {
      const ctor = (target as { constructor: new (...args: unknown[]) => unknown }).constructor;
      const cur =
        (Reflect.getMetadata(
          HTTP_METHOD_USE_MIDDLEWARE_METADATA,
          ctor,
          propertyKey,
        ) as HttpMiddleware[] | undefined) ?? [];
      Reflect.defineMetadata(
        HTTP_METHOD_USE_MIDDLEWARE_METADATA,
        [...cur, ...middlewares],
        ctor,
        propertyKey,
      );
    }
  }) as ClassDecorator & MethodDecorator;
}
