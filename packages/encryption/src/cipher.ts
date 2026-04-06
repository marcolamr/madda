export type CipherName = "aes-256-cbc" | "aes-128-cbc";

export const SUPPORTED_CIPHERS: Record<
  CipherName,
  { keySize: number; ivLength: number; aead: boolean }
> = {
  "aes-256-cbc": { keySize: 32, ivLength: 16, aead: false },
  "aes-128-cbc": { keySize: 16, ivLength: 16, aead: false },
};

/**
 * Normalise Laravel-style cipher names (`AES-256-CBC` → `aes-256-cbc`).
 */
export function normalizeCipherName(cipher: string): CipherName {
  const c = cipher.trim().toLowerCase();
  if (c in SUPPORTED_CIPHERS) {
    return c as CipherName;
  }
  throw new Error(
    `Unsupported cipher "${cipher}". Supported: ${Object.keys(SUPPORTED_CIPHERS).join(", ")}.`,
  );
}
