/** Subconjunto do contrato mental de `Illuminate\Contracts\Cache\Repository`. */
export interface CacheRepository {
  get<T = unknown>(key: string): Promise<T | undefined>;

  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;

  forever(key: string, value: unknown): Promise<void>;

  forget(key: string): Promise<boolean>;

  flush(): Promise<void>;

  /**
   * Apaga entradas cuja chave começa por `prefix` (scan em ficheiro; KEYS em Redis — cuidado em produção).
   */
  flushPrefix(prefix: string): Promise<void>;

  remember<T>(
    key: string,
    ttlSeconds: number,
    callback: () => T | Promise<T>,
  ): Promise<T>;

  many(keys: string[]): Promise<Record<string, unknown>>;

  putMany(entries: Record<string, unknown>, ttlSeconds?: number): Promise<void>;
}
