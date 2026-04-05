export type ContainerFactory<T = unknown> = (container: ContainerContract) => T;

export interface ContainerContract {
  bind<T>(
    key: string,
    factory: ContainerFactory<T>,
    singleton?: boolean,
  ): ContainerContract;

  singleton<T>(key: string, factory: ContainerFactory<T>): ContainerContract;

  instance<T>(key: string, value: T): ContainerContract;

  make<T>(key: string): T;

  has(key: string): boolean;
}
