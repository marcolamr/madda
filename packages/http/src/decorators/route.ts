import { HTTP_METHOD_METADATA, HTTP_PATH_METADATA } from "@madda/reflection";
import type { HttpMethod } from "../types.js";

function routeDecorator(method: HttpMethod, path: string): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(HTTP_METHOD_METADATA, method, target.constructor, propertyKey);
    Reflect.defineMetadata(HTTP_PATH_METADATA, path, target.constructor, propertyKey);
  };
}

export function Get(path = ""): MethodDecorator {
  return routeDecorator("get", path);
}

export function Post(path = ""): MethodDecorator {
  return routeDecorator("post", path);
}

export function Put(path = ""): MethodDecorator {
  return routeDecorator("put", path);
}

export function Patch(path = ""): MethodDecorator {
  return routeDecorator("patch", path);
}

export function Delete(path = ""): MethodDecorator {
  return routeDecorator("delete", path);
}

export function Head(path = ""): MethodDecorator {
  return routeDecorator("head", path);
}

export function Options(path = ""): MethodDecorator {
  return routeDecorator("options", path);
}
