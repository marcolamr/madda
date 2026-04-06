/** Uma loja em `config/cache.stores`. */
export interface CacheStoreConfigShape {
  driver: "file" | "array" | "redis";
  /** Obrigatório para `file` (diretório raiz dos blobs). */
  path?: string;
  /** Nome da ligação em `config/redis.connections` quando `driver === 'redis'`. */
  connection?: string;
  /** Prefixo aplicado a todas as chaves desta loja. */
  prefix?: string;
}

/** Forma esperada em `config/cache`. */
export interface CacheConfigShape {
  /** Nome da loja em `stores` usada por defeito — em Madda o default é `file`. */
  default: string;
  stores: Record<string, CacheStoreConfigShape>;
}
