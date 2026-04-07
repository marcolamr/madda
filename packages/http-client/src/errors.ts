export class HttpClientError extends Error {
  readonly status: number;
  readonly bodyText: string;

  constructor(status: number, bodyText: string, message?: string) {
    super(message ?? `HTTP ${status}`);
    this.name = "HttpClientError";
    this.status = status;
    this.bodyText = bodyText;
  }
}
