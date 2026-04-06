/** Uma entrada em `queue.connections`. */
export interface QueueConnectionConfigShape {
  driver: "sync" | "redis" | "database";
  /** Ligação Redis (`redis.connections`) ou BD (`database.default` / nome). */
  connection?: string;
  /** Nome lógico da fila (sufixo da chave Redis ou coluna `queue`). */
  queue?: string;
  /** Apenas `driver === "database"`: tabela de jobs (identificador seguro: `[\w]+`). */
  table?: string;
}

/** Forma esperada em `config/queue` (ou equivalente). */
export interface QueueConfigShape {
  /** Nome da ligação em `connections` (por defeito `sync`). */
  default?: string;
  connections?: Record<string, QueueConnectionConfigShape>;
}
