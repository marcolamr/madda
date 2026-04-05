import type { BindingBuilderContract, BindingScope, Token } from "./types.js";

export type ResolveFactory<T = unknown> = (
  container: ContainerContract,
) => T | Promise<T>;

/** Resolution-only surface (factories, adapters). */
export interface ContainerResolutionContract {
  get<T>(token: Token<T>): T;
  make<T>(token: Token<T>): Promise<T>;
  has(token: Token): boolean;
}

export type ContainerRefForFactory = ContainerResolutionContract;

/**
 * Application container contract (resolution, scopes, tags), inspired by
 * {@link https://github.com/laravel/framework/blob/13.x/src/Illuminate/Container/Container.php Laravel's Container}.
 */
export interface ContainerContract extends ContainerResolutionContract {
  bind<T>(token: Token<T>, value: unknown): BindingBuilderContract<T>;

  singleton<T>(token: Token<T>, value: unknown): BindingBuilderContract<T>;

  scoped<T>(token: Token<T>, value: unknown): BindingBuilderContract<T>;

  /**
   * Explicit closure binding (like Laravel's `bind` with a closure).
   */
  bindUsing<T>(
    token: Token<T>,
    factory: ResolveFactory<T>,
    scope?: BindingScope,
  ): BindingBuilderContract<T>;

  /**
   * Register a shared instance (`Container::instance` in Laravel).
   */
  instance<T>(token: Token<T>, value: T): ContainerContract;

  createScope(): ContainerContract;

  tagged<T>(tag: string): T[];

  taggedAsync<T>(tag: string): Promise<T[]>;
}
