import { HttpClientError } from "./errors.js";

export type CreateHttpClientOptions = {
  /** Prefixo absoluto ou relativo (ex. `https://api.example` ou `` para mesma origem). */
  baseUrl?: string;
  /** Por defeito `same-origin`; use `include` para cookies em subdomínios ou após login. */
  credentials?: "omit" | "include" | "same-origin";
  headers?: Record<string, string>;
};

async function readJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!res.ok) {
    throw new HttpClientError(res.status, text);
  }
  if (!text.length) {
    return undefined as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpClientError(res.status, text, "Response is not valid JSON");
  }
}

/**
 * Cliente HTTP mínimo em cima de `fetch` (simetria com Laravel `Http` / Guzzle, sem dependências extra).
 */
export function createHttpClient(options?: CreateHttpClientOptions) {
  const base = options?.baseUrl?.replace(/\/$/, "") ?? "";
  const credentials = options?.credentials ?? "same-origin";
  const defaultHeaders = options?.headers ?? {};

  function url(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${base}${p}`;
  }

  return {
    async getJson<T>(path: string, init?: RequestInit): Promise<T> {
      const res = await fetch(url(path), {
        ...init,
        method: "GET",
        credentials,
        headers: { ...defaultHeaders, ...init?.headers },
      });
      return readJsonOrThrow<T>(res);
    },

    async postJson<TResponse, TBody = unknown>(
      path: string,
      body: TBody,
      init?: RequestInit,
    ): Promise<TResponse> {
      if (body === undefined) {
        throw new TypeError("createHttpClient.postJson: body is required (undefined would omit the fetch body)");
      }
      const json = typeof body === "string" ? body : JSON.stringify(body);
      const res = await fetch(url(path), {
        ...init,
        method: "POST",
        credentials,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...defaultHeaders,
          ...init?.headers,
        },
        body: json,
      });
      return readJsonOrThrow<TResponse>(res);
    },

    async postEmpty(path: string, init?: RequestInit): Promise<void> {
      const res = await fetch(url(path), {
        ...init,
        method: "POST",
        credentials,
        headers: { ...defaultHeaders, ...init?.headers },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new HttpClientError(res.status, text);
      }
    },
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
