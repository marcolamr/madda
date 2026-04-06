import type { ConfigContract } from "@madda/config";
import type { ContainerContract } from "@madda/container";
import type { ExceptionsContract } from "./exceptions-contract.js";
import type { MiddlewareContract } from "./middleware-contract.js";
import type { RoutingConfig } from "./routing-contract.js";

export interface ApplicationConfigureOptions {
  basePath: string;
}

export type MiddlewareCallback = (middleware: MiddlewareContract) => void;
export type ExceptionsCallback = (exceptions: ExceptionsContract) => void;

/**
 * The application contract — kernel-agnostic.
 * Neither HTTP nor CLI specifics belong here; that is the kernel's responsibility.
 */
export interface ApplicationContract {
  readonly basePath: string;
  readonly container: ContainerContract;
  readonly config?: ConfigContract;
  readonly routing: RoutingConfig;
  readonly middlewareCallback?: MiddlewareCallback;
  readonly exceptionsCallback?: ExceptionsCallback;
}

export interface ApplicationBuilderContract {
  withConfig(config: ConfigContract): ApplicationBuilderContract;
  withRouting(config: RoutingConfig): ApplicationBuilderContract;
  withMiddleware(callback: MiddlewareCallback): ApplicationBuilderContract;
  withExceptions(callback: ExceptionsCallback): ApplicationBuilderContract;
  create(): ApplicationContract;
}
