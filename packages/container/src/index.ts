import "reflect-metadata";

export { BindingBuilder } from "./binding-builder.js";
export type { BindingBuilderContract } from "./types.js";
export type {
  ContainerContract,
  ContainerRefForFactory,
  ContainerResolutionContract,
  ResolveFactory,
} from "./container-contract.js";
export { Container } from "./container.js";
export { Inject, INJECT_METADATA_KEY } from "./decorators.js";
export { BindingNotFoundError, CircularDependencyError } from "./errors.js";
export type { BindingScope, Token } from "./types.js";
