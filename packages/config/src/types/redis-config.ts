/** Forma esperada em `config/redis` (ou equivalente no objeto de config). */
export interface RedisConnectionConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  tls?: boolean;
}

export interface RedisConfigShape {
  default: string;
  connections: Record<string, RedisConnectionConfig>;
}
