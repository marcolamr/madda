import argon2 from "argon2";

/**
 * Optional tuning for Argon2id. See the `argon2` package for full option list.
 */
export type HashPasswordOptions = NonNullable<Parameters<typeof argon2.hash>[1]>;

/**
 * Hash a password with **Argon2id** (OWASP-recommended variant).
 *
 * Default parameters follow sensible Node/server defaults; pass `options` to tune
 * `memoryCost`, `timeCost`, `parallelism`, etc.
 */
export async function hashPassword(
  plain: string,
  options?: HashPasswordOptions,
): Promise<string> {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    ...options,
  });
}

/**
 * Verify a plaintext password against an Argon2-encoded hash string.
 * Returns `false` on mismatch or malformed hash.
 */
export async function verifyPassword(
  hash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}
