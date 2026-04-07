/**
 * Contrato público por rota: partes do pedido validadas em runtime com AJV.
 * `responses` alimenta OpenAPI; validação de resposta em runtime não é aplicada por defeito.
 */
export type HttpRouteJsonSchema = {
  /** Query string como objeto chave → valor (strings vindas do HTTP). */
  query?: Record<string, unknown>;
  /** Parâmetros de path (Fastify `:id`). */
  params?: Record<string, unknown>;
  /** Corpo JSON já parseado. */
  body?: Record<string, unknown>;
  /** Cabeçalhos como objeto (chaves em minúsculas alinhadas a `HttpRequest.headers`). */
  headers?: Record<string, unknown>;
  /** Chave = código HTTP em string, ex. `"200"`, `"422"`. Só documentação OpenAPI. */
  responses?: Record<string, Record<string, unknown>>;
};
