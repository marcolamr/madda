/**
 * Superfície mínima para cache / sessão — fácil de mockar em testes.
 */
export interface RedisConnectionContract {
  ping(): Promise<unknown>;

  get(key: string): Promise<string | null>;

  set(key: string, value: string): Promise<unknown>;

  setex(key: string, seconds: number, value: string): Promise<unknown>;

  mget(keys: string[]): Promise<(string | null)[]>;

  del(...keys: string[]): Promise<number>;

  keys(pattern: string): Promise<string[]>;

  flushdb(): Promise<unknown>;

  quit(): Promise<unknown>;
}
