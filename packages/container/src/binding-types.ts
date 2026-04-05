import type { ResolveFactory } from "./container-contract.js";
import type { BindingScope, Token } from "./types.js";

export type Binding<T = unknown> = {
  token: Token;
  scope: BindingScope;
  tags?: string[];
  useValue?: T;
  useFactory?: ResolveFactory<T>;
  useClass?: new (...args: unknown[]) => T;
  instance?: T;
};
