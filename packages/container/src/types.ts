/**
 * Registration / resolution key: string (Laravel-style id), symbol, or constructor.
 * See {@link https://github.com/laravel/framework/tree/13.x/src/Illuminate/Container Illuminate\\Container}.
 */
export type Token<T = unknown> =
  | string
  | symbol
  | (abstract new (...args: unknown[]) => T);

export type BindingScope = "transient" | "singleton" | "scoped";

export interface BindingBuilderContract<T = unknown> {
  tag(...tags: string[]): BindingBuilderContract<T>;
}
