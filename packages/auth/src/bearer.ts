import { getRequestHeader } from "@madda/cookie";
import type { HttpContext } from "@madda/http";

const MAX_BEARER_TOKEN_BYTES = 8192;

/** Caracteres de controlo / quebra de linha (evita smuggling e tokens ambíguos). */
const CTRL = /[\x00-\x1f\x7f]/;

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
  if (CTRL.test(token)) {
    return undefined;
  }
  return token;
}
