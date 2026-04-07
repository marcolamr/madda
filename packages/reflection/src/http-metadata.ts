/** Metadados de routing HTTP — partilhados por `@madda/http` e consumidores. */

export const HTTP_METHOD_METADATA = Symbol.for("madda.http.method");
export const HTTP_PATH_METADATA = Symbol.for("madda.http.path");
export const HTTP_CONTROLLER_PREFIX_METADATA = Symbol.for("madda.http.controllerPrefix");
export const HTTP_USE_MIDDLEWARE_METADATA = Symbol.for("madda.http.useMiddleware");
export const HTTP_METHOD_USE_MIDDLEWARE_METADATA = Symbol.for("madda.http.methodUseMiddleware");
/** JSON Schema (draft-2020-12) por parte do pedido — ver `@madda/jsonschema`. */
export const HTTP_ROUTE_JSON_SCHEMA_METADATA = Symbol.for("madda.http.routeJsonSchema");
