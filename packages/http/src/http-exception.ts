/**
 * HTTP error with a status code and optional JSON body (similar to Nest `HttpException`).
 */
export class HttpException extends Error {
  readonly statusCode: number;
  readonly body: unknown;

  constructor(statusCode: number, message?: string, body?: unknown) {
    super(message ?? `HTTP ${statusCode}`);
    this.name = "HttpException";
    this.statusCode = statusCode;
    this.body = body ?? { message: message ?? `HTTP ${statusCode}` };
  }
}
