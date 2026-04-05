import "reflect-metadata";
import type { ContainerContract, ResolveFactory } from "./container-contract.js";
import { BindingBuilder } from "./binding-builder.js";
import { INJECT_METADATA_KEY } from "./decorators.js";
import { BindingNotFoundError, CircularDependencyError } from "./errors.js";
import type { Binding } from "./binding-types.js";
import type { BindingBuilderContract, BindingScope, Token } from "./types.js";

export class Container implements ContainerContract {
  private readonly bindings = new Map<Token, Binding>();
  private readonly resolving = new Set<Token>();
  private readonly scopedCache = new Map<Token, unknown>();
  private readonly parent: Container | undefined;

  constructor(parent?: Container) {
    this.parent = parent;
  }

  bind<T>(token: Token<T>, value: unknown): BindingBuilderContract<T> {
    const binding = this.normalize(token, value, "transient");
    this.bindings.set(token, binding);
    return new BindingBuilder(binding);
  }

  singleton<T>(token: Token<T>, value: unknown): BindingBuilderContract<T> {
    const binding = this.normalize(token, value, "singleton");
    this.bindings.set(token, binding);
    return new BindingBuilder(binding);
  }

  scoped<T>(token: Token<T>, value: unknown): BindingBuilderContract<T> {
    const binding = this.normalize(token, value, "scoped");
    this.bindings.set(token, binding);
    return new BindingBuilder(binding);
  }

  bindUsing<T>(
    token: Token<T>,
    factory: ResolveFactory<T>,
    scope: BindingScope = "transient",
  ): BindingBuilderContract<T> {
    const binding: Binding<T> = {
      token,
      scope,
      useFactory: factory,
    };
    this.bindings.set(token, binding);
    return new BindingBuilder(binding);
  }

  instance<T>(token: Token<T>, value: T): ContainerContract {
    const binding: Binding<T> = {
      token,
      scope: "singleton",
      useValue: value,
      instance: value,
    };
    this.bindings.set(token, binding);
    return this;
  }

  has(token: Token): boolean {
    return this.bindings.has(token) || !!this.parent?.has(token);
  }

  get<T>(token: Token<T>): T {
    const result = this.resolve(token, false);
    if (result instanceof Promise) {
      throw new Error("Use make() for async dependencies.");
    }
    return result;
  }

  make<T>(token: Token<T>): Promise<T> {
    return Promise.resolve(this.resolve(token, true));
  }

  createScope(): ContainerContract {
    return new Container(this);
  }

  tagged<T>(tag: string): T[] {
    return this.bindingsWithTag(tag).map((b) => {
      const result = this.resolve<T>(b.token as Token<T>, false);
      if (result instanceof Promise) {
        throw new Error("Use taggedAsync() for async dependencies.");
      }
      return result;
    });
  }

  async taggedAsync<T>(tag: string): Promise<T[]> {
    const bindings = this.bindingsWithTag(tag);
    const results = bindings.map((b) => this.resolve<T>(b.token as Token<T>, true));
    return Promise.all(results);
  }

  private resolve<T>(token: Token<T>, isAsync: boolean): T | Promise<T> {
    if (this.resolving.has(token)) {
      throw new CircularDependencyError(token);
    }

    this.resolving.add(token);

    try {
      const binding = this.getBinding(token);

      if (!binding) {
        if (typeof token === "function") {
          return this.instantiate(
            token as new (...args: unknown[]) => T,
            isAsync,
          );
        }
        throw new BindingNotFoundError(token);
      }

      if (binding.scope === "singleton" && binding.instance !== undefined) {
        return binding.instance as T;
      }

      if (binding.scope === "scoped" && this.scopedCache.has(token)) {
        return this.scopedCache.get(token) as T;
      }

      let result: T | Promise<T>;

      if (binding.useValue !== undefined) {
        result = binding.useValue as T;
      } else if (binding.useFactory) {
        const out = binding.useFactory(this);
        result = out as T | Promise<T>;
      } else if (binding.useClass) {
        const out = this.instantiate(binding.useClass as new (...args: unknown[]) => T, isAsync);
        result = out as T | Promise<T>;
      } else {
        throw new BindingNotFoundError(token);
      }

      if (binding.scope === "singleton") {
        if (result instanceof Promise) {
          return result.then((resolved) => {
            binding.instance = resolved;
            return resolved;
          });
        }
        binding.instance = result;
      } else if (binding.scope === "scoped") {
        if (result instanceof Promise) {
          return result.then((resolved) => {
            this.scopedCache.set(token, resolved);
            return resolved;
          });
        }
        this.scopedCache.set(token, result);
      }

      return result;
    } finally {
      this.resolving.delete(token);
    }
  }

  private getBinding(token: Token): Binding | undefined {
    return this.bindings.get(token) ?? this.parent?.getBinding(token);
  }

  private bindingsWithTag(tag: string): Binding[] {
    const local = [...this.bindings.values()].filter((b) => b.tags?.includes(tag));
    const parentResult = this.parent ? this.parent.bindingsWithTag(tag) : [];
    const localTokens = new Set(local.map((b) => b.token));
    return [...local, ...parentResult.filter((b) => !localTokens.has(b.token))];
  }

  private normalize<T>(token: Token<T>, value: unknown, scope: BindingScope): Binding<T> {
    if (this.isConstructorFunction<T>(value)) {
      return {
        token,
        scope,
        useClass: value,
      };
    }

    return {
      token,
      scope,
      useValue: value as T,
    };
  }

  /**
   * Distinguishes constructible functions from plain callables (factories).
   * Arrow functions / many closures have no own `prototype`.
   */
  private isConstructorFunction<T>(
    value: unknown,
  ): value is new (...args: unknown[]) => T {
    return (
      typeof value === "function" &&
      Object.prototype.hasOwnProperty.call(value, "prototype")
    );
  }

  private instantiate<T>(
    target: new (...args: unknown[]) => T,
    isAsync: boolean,
  ): T | Promise<T> {
    const paramTypes =
      (Reflect.getMetadata(
        "design:paramtypes",
        target,
      ) as unknown[] | undefined) ?? [];

    const injectTokens =
      (Reflect.getMetadata(INJECT_METADATA_KEY, target) as Record<number, Token> | undefined) ??
      {};

    const deps = paramTypes.map((type, index) => {
      const injectToken = injectTokens[index] ?? (type as Token);
      return this.resolve(injectToken, isAsync);
    });

    if (deps.some((d) => d instanceof Promise)) {
      return Promise.all(deps).then((resolved) => new target(...resolved));
    }

    return new target(...(deps as unknown[]));
  }
}
