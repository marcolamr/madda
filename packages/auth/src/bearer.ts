import { getRequestHeader } from "@madda/cookie";
import type { HttpContext } from "@madda/http";

const MAX_BEARER_TOKEN_BYTES = 8192;

/** C0 + DEL (equivalente a `/[\x00-\x1f\x7f]/`; evita `no-control-regex`). */
function hasAsciiControlOrDel(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x1f || c === 0x7f) {
      return true;
    }
  }
  return false;
}

/**
 * Extrai o token do cabeçalho `Authorization: Bearer` (um único token sem espaços).
 */
export function extractBearerToken(ctx: HttpContext): string | undefined {
  const h = getRequestHeader(ctx.request, "authorization");
  if (!h) {
    return undefined;
  }
  const m = h.match(/^\s*Bearer\s+(\S+)\s*$/i);
  const token = m?.[1];
  if (!token) {
    return undefined;
  }
  if (token.length > MAX_BEARER_TOKEN_BYTES) {
    return undefined;
  }
  if (hasAsciiControlOrDel(token)) {
    return undefined;
  }
  return token;
}
