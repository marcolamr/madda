import { createHmac, timingSafeEqual } from "node:crypto";

/** `base64url(val).sig` com HMAC-SHA256 (adequado a IDs de sessão, etc.). */
export function signCookieValue(secret: Buffer, value: string): string {
  const body = Buffer.from(value, "utf8").toString("base64url");
  const sig = createHmac("sha256", secret).update(value, "utf8").digest("base64url");
  return `${body}.${sig}`;
}

export function unsignCookieValue(secret: Buffer, payload: string): string | undefined {
  const dot = payload.lastIndexOf(".");
  if (dot <= 0) {
    return undefined;
  }
  const body = payload.slice(0, dot);
  const sig = payload.slice(dot + 1);
  let value: string;
  try {
    value = Buffer.from(body, "base64url").toString("utf8");
  } catch {
    return undefined;
  }
  const expected = createHmac("sha256", secret).update(value, "utf8").digest("base64url");
  try {
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return undefined;
    }
  } catch {
    return undefined;
  }
  return value;
}
