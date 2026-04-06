export type SameSitePolicy = "Strict" | "Lax" | "None";

export type SerializeCookieOptions = {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: SameSitePolicy;
};

function fmtDate(d: Date): string {
  return d.toUTCString();
}

/**
 * Gera uma linha `Set-Cookie` (nome e valor devem ser ASCII seguros; valor pode ser URL-encoded).
 */
export function serializeSetCookie(
  name: string,
  value: string,
  options: SerializeCookieOptions = {},
): string {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];
  if (options.path !== undefined) {
    parts.push(`Path=${options.path}`);
  }
  if (options.domain !== undefined) {
    parts.push(`Domain=${options.domain}`);
  }
  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${Math.floor(options.maxAge)}`);
  }
  if (options.expires !== undefined) {
    parts.push(`Expires=${fmtDate(options.expires)}`);
  }
  if (options.secure) {
    parts.push("Secure");
  }
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.sameSite !== undefined) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  return parts.join("; ");
}
