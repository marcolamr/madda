import type { ContainerContract, ContainerFactory } from "./container-contract.js";

export class Container implements ContainerContract {
  private readonly bindings = new Map<
    string,
    { factory: ContainerFactory; singleton: boolean }
  >();
  private readonly instances = new Map<string, unknown>();

  bind<T>(
    key: string,
    factory: ContainerFactory<T>,
    singleton = false,
  ): ContainerContract {
    this.bindings.set(key, {
      factory: factory as ContainerFactory,
      singleton,
    });
    return this;
  }

  singleton<T>(key: string, factory: ContainerFactory<T>): ContainerContract {
    return this.bind(key, factory, true);
  }

  instance<T>(key: string, value: T): ContainerContract {
    this.instances.set(key, value);
    return this;
  }

  make<T>(key: string): T {
    if (this.instances.has(key)) {
      return this.instances.get(key) as T;
    }
    const binding = this.bindings.get(key);
    if (!binding) {
      throw new Error(`No binding registered for key: ${key}`);
    }
    if (binding.singleton) {
      const created = binding.factory(this);
      this.instances.set(key, created);
      return created as T;
    }
    return binding.factory(this) as T;
  }

  has(key: string): boolean {
    return this.instances.has(key) || this.bindings.has(key);
  }
}
