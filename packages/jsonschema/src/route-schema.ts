import { HTTP_ROUTE_JSON_SCHEMA_METADATA } from "@madda/reflection";
import type { HttpRouteJsonSchema } from "./types.js";

/**
 * Anexa contrato JSON Schema à rota (validação em `registerController` + OpenAPI).
 */
export function RouteSchema(spec: HttpRouteJsonSchema): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(
      HTTP_ROUTE_JSON_SCHEMA_METADATA,
      spec,
      target.constructor,
      propertyKey,
    );
  };
}
