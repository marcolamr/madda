import type { Logger } from "pino";

/**
 * Driver-agnostic view of an incoming HTTP message.
 */
export interface HttpRequest {
  readonly method: string;
  readonly path: string;
  /** Parsed query string (first value per key). */
  readonly query: Readonly<Record<string, string | undefined>>;
  /**
   * Parâmetros de rota do driver (ex. `:id` em Fastify).
   * Vazio quando a rota não define params.
   */
  readonly params: Readonly<Record<string, string>>;
  /**
   * Corpo parseado pelo driver (ex. JSON no Fastify). `undefined` se não houver corpo.
   */
  readonly body: unknown;
  /**
   * Cabeçalhos HTTP em minúsculas (como no Node). Usado por cookies/sessão.
   */
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  /**
   * Pedido nativo do driver (ex.: `FastifyRequest`) para streaming, `close`, etc.
   * Usado por `@madda/broadcasting` (SSE/WebSocket).
   */
  readonly driverRequest?: unknown;
}

/**
 * Driver-agnostic response writer presented to route handlers.
 */
export interface HttpReply {
  status(code: number): HttpReply;
  header(name: string, value: string): HttpReply;
  /**
   * Adiciona um `Set-Cookie` sem substituir os já definidos (usa `appendHeader` no Node quando disponível).
   */
  appendCookieLine(line: string): HttpReply;
  send(body?: string): void;
  json(payload: unknown): void;
  /** Last status set via {@link HttpReply.status} (falls back to driver default, e.g. 200). */
  getStatusCode(): number;
  /**
   * Resposta nativa do driver (ex.: `FastifyReply`) para `hijack`, SSE, etc.
   * Usado por `@madda/broadcasting`.
   */
  readonly driverReply?: unknown;
}

/**
 * One request/response pair as seen by application code.
 * `state` is a mutable bag (Laravel `request` merge / Koa-style).
 * `log` is a request-scoped child logger when the server was created with logging enabled.
 */
export interface HttpContext {
  readonly request: HttpRequest;
  readonly reply: HttpReply;
  readonly log: Logger;
  /** Shared mutable object for middleware → handler data. */
  readonly state: Record<string, unknown>;
}
