import "@madda/reflection";

export {
  HTTP_BEFORE_SEND_STATE_KEY,
  type HttpBeforeSendCallback,
} from "./before-send.js";
export {
  HTTP_CONTROLLER_PREFIX_METADATA,
  HTTP_METHOD_METADATA,
  HTTP_METHOD_USE_MIDDLEWARE_METADATA,
  HTTP_PATH_METADATA,
  HTTP_ROUTE_JSON_SCHEMA_METADATA,
  HTTP_USE_MIDDLEWARE_METADATA,
} from "@madda/reflection";
export { Controller, UseMiddleware } from "./decorators/controller.js";
export {
  Delete,
  Get,
  Head,
  Options,
  Patch,
  Post,
  Put,
} from "./decorators/route.js";
export { createLoggerAndAccessFlagsFromLoggingConfig } from "@madda/log";
export { createHttpServer, DefaultHttpServerFactory } from "./factory.js";
export type { HttpDriverContract } from "./http-driver-contract.js";
export type { HttpErrorHandler } from "./http-error-handler-contract.js";
export { HttpException } from "./http-exception.js";
export type { HttpMiddleware, NextFunction } from "./http-middleware-contract.js";
export type { HttpServerFactoryContract } from "./http-server-factory-contract.js";
export { joinPaths } from "./path-utils.js";
export type { RegisterControllerOptions } from "./register-controller.js";
export { registerController } from "./register-controller.js";
export { HttpRouter } from "./router.js";
export type { GroupOptions } from "./router.js";
export type {
  CreateHttpServerOptions,
  HttpDriverKind,
  HttpServer,
  RouteRegistrar,
} from "./server.js";
export { BROADCASTING_HTTP_CONTRACT_VERSION } from "./broadcasting-contract.js";
export type { HttpContext, HttpReply, HttpRequest } from "./http-message-contract.js";
export type { HttpMethod, RouteHandler } from "./types.js";
export { composeMiddlewares } from "./middleware/compose.js";
export { createDefaultErrorHandler } from "./middleware/default-error-handler.js";
export { requestLoggingMiddleware } from "./middleware/request-logging.js";
export {
  requestTimingMiddleware,
  type RequestTimingMiddlewareOptions,
} from "./middleware/request-timing.js";
export { withErrorHandling } from "./middleware/with-error-handling.js";
export {
  buildOpenApiDocument,
  discoverControllerRoutes,
  JsonSchemaValidationError,
  RouteSchema,
} from "@madda/jsonschema";
export type {
  BuildOpenApiDocumentOptions,
  DiscoveredControllerRoute,
  HttpRouteJsonSchema,
  JsonSchemaIssue,
  OpenApiDocument31,
} from "@madda/jsonschema";
