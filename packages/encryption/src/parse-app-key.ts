import { EncryptException } from "./exceptions.js";

/**
 * Decode `APP_KEY` from `.env` — same format as Laravel (`base64:...`).
 *
 * @see https://laravel.com/docs/13.x/encryption
 */
export function parseAppKey(appKey: string): Buffer {
  const trimmed = appKey.trim().replace(/^["']|["']$/g, "");
  if (!trimmed.startsWith("base64:")) {
    throw new EncryptException(
      'Invalid APP_KEY format. Expected "base64:..." (run key:generate).',
    );
  }
  return Buffer.from(trimmed.slice("base64:".length), "base64");
}
