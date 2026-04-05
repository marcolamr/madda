/**
 * Driver-agnostic view of an incoming HTTP message.
 */
export interface HttpRequest {
  readonly method: string;
  readonly path: string;
}

/**
 * Driver-agnostic response writer presented to route handlers.
 */
export interface HttpReply {
  status(code: number): HttpReply;
  header(name: string, value: string): HttpReply;
  send(body?: string): void;
  json(payload: unknown): void;
}

/**
 * One request/response pair as seen by application code.
 */
export interface HttpContext {
  readonly request: HttpRequest;
  readonly reply: HttpReply;
}
