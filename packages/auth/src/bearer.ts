import { getRequestHeader } from "@madda/cookie";
import type { HttpContext } from "@madda/http";

export function extractBearerToken(ctx: HttpContext): string | undefined {
  const h = getRequestHeader(ctx.request, "authorization");
  if (!h) {
    return undefined;
  }
  const m = h.match(/^\s*Bearer\s+(.+)$/i);
  return m?.[1]?.trim();
}
