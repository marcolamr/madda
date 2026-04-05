import type { ConfigContract } from "@madda/config";
import type { ContainerContract } from "@madda/container";
import type { CreateHttpServerOptions, HttpServer } from "@madda/http";
import type { ExceptionsContract } from "./exceptions-contract.js";
import type { MiddlewareContract } from "./middleware-contract.js";
import type { RoutingConfig } from "./routing-contract.js";

export interface ApplicationConfigureOptions {
  basePath: string;
}

export type MiddlewareCallback = (middleware: MiddlewareContract) => void;
export type ExceptionsCallback = (exceptions: ExceptionsContract) => void;

export interface ApplicationContract {
  readonly basePath: string;
  readonly container: ContainerContract;
  readonly http: HttpServer;
  readonly config?: ConfigContract;

  listen(port: number, host?: string): Promise<void>;
  close(): Promise<void>;
}

export interface ApplicationBuilderContract {
  withConfig(config: ConfigContract): ApplicationBuilderContract;
  withRouting(config: RoutingConfig): ApplicationBuilderContract;
  withMiddleware(callback: MiddlewareCallback): ApplicationBuilderContract;
  withExceptions(callback: ExceptionsCallback): ApplicationBuilderContract;
  withHttpServer(options: CreateHttpServerOptions): ApplicationBuilderContract;
  create(): ApplicationContract;
}
