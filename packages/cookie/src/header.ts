export type HasHeaders = {
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
};

/** Primeiro valor do cabeçalho (case-insensitive). */
export function getRequestHeader(request: HasHeaders, name: string): string | undefined {
  const key = name.toLowerCase();
  const h = request.headers[key];
  if (h === undefined) {
    return undefined;
  }
  return Array.isArray(h) ? h[0] : h;
}

export function getCookieHeader(request: HasHeaders): string | undefined {
  return getRequestHeader(request, "cookie");
}
