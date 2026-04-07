import { ArrayCacheStore } from "@madda/cache";

/**
 * Repositório de cache em memória para testes (mesmo que {@link ArrayCacheStore}, nome explícito).
 */
export function createInMemoryTestCache(): ArrayCacheStore {
  return new ArrayCacheStore();
}

export { ArrayCacheStore } from "@madda/cache";
