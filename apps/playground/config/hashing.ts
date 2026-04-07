import type { HashingConfig } from "@madda/hashing";

const hashVerify = process.env["HASH_VERIFY"] !== "false";

export default {
  driver: (process.env["HASH_DRIVER"] ?? "argon2id") as HashingConfig["driver"],
  bcrypt: {
    rounds: Number(process.env["BCRYPT_ROUNDS"] ?? 12),
    verify: hashVerify,
    limit: process.env["BCRYPT_LIMIT"]
      ? Number(process.env["BCRYPT_LIMIT"])
      : null,
  },
  argon: {
    memory: Number(process.env["ARGON_MEMORY"] ?? 65536),
    threads: Number(process.env["ARGON_THREADS"] ?? 1),
    time: Number(process.env["ARGON_TIME"] ?? 4),
    verify: hashVerify,
  },
  rehash_on_login: process.env["HASH_REHASH_ON_LOGIN"] !== "false",
} satisfies HashingConfig;
