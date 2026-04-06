/** Forma esperada em `config/session` (ou equivalente). */
export interface SessionStoreConfigShape {
  driver: "file" | "redis";
  path?: string;
  connection?: string;
  /** TTL em segundos (cookie + loja). */
  lifetime?: number;
}

export interface SessionConfigShape {
  driver: string;
  /** Nome do cookie de sessão. */
  cookie?: string;
  /** Caminho do cookie. */
  path?: string;
  domain?: string;
  secure?: boolean;
  http_only?: boolean;
  same_site?: "lax" | "strict" | "none";
  lifetime?: number;
  stores?: Record<string, SessionStoreConfigShape>;
}
