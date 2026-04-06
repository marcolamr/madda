import type { CacheRepository } from "./cache-repository.js";
import { CacheStoreNotFoundError } from "./errors.js";

export class CacheManager {
  constructor(
    private readonly defaultStore: string,
    private readonly stores: ReadonlyMap<string, CacheRepository>,
  ) {}

  store(name?: string): CacheRepository {
    const n = name ?? this.defaultStore;
    const s = this.stores.get(n);
    if (!s) {
      throw new CacheStoreNotFoundError(n);
    }
    return s;
  }

  defaultStoreName(): string {
    return this.defaultStore;
  }

  has(name: string): boolean {
    return this.stores.has(name);
  }
}
