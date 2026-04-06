import type { HashDriver } from "./hashing-config.js";

/** Infer which driver produced `hashed` (bcrypt / Argon2i / Argon2id). */
export function detectHashDriver(hashed: string): HashDriver | null {
  if (/^\$2[aby]\$/.test(hashed)) {
    return "bcrypt";
  }
  if (hashed.startsWith("$argon2i$")) {
    return "argon";
  }
  if (hashed.startsWith("$argon2id$")) {
    return "argon2id";
  }
  return null;
}

/**
 * Parse Argon2 parameter block `$m=...,t=...,p=...$` from a hash string.
 */
export function parseArgonParams(
  hashed: string,
): { memory: number; time: number; parallelism: number } | null {
  const m = hashed.match(
    /\$argon2(?:id|i)\$v=\d+\$m=(\d+),t=(\d+),p=(\d+)\$/,
  );
  if (!m) {
    return null;
  }
  return {
    memory: Number(m[1]),
    time: Number(m[2]),
    parallelism: Number(m[3]),
  };
}
