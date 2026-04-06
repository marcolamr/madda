export class CacheStoreNotFoundError extends Error {
  constructor(readonly name: string) {
    super(`Cache store "${name}" is not registered.`);
    this.name = "CacheStoreNotFoundError";
  }
}

export class CacheStoreMisconfiguredError extends Error {
  constructor(readonly store: string, message: string) {
    super(`Cache store "${store}": ${message}`);
    this.name = "CacheStoreMisconfiguredError";
  }
}
