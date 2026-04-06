import { hash, verify } from "argon2";

import type { HashingConfig } from "./hashing-config.js";
import { parseArgonParams } from "./detect-driver.js";

/** Argon2 variant: `argon2i` (1) or `argon2id` (2). */
export type Argon2Type = 1 | 2;

export class ArgonHasher {
  constructor(
    private readonly opts: HashingConfig["argon"],
    private readonly type: Argon2Type,
  ) {}

  async make(
    plain: string,
    options?: Partial<HashingConfig["argon"]>,
  ): Promise<string> {
    return hash(plain, {
      type: this.type,
      memoryCost: options?.memory ?? this.opts.memory,
      timeCost: options?.time ?? this.opts.time,
      parallelism: options?.threads ?? this.opts.threads,
    });
  }

  async check(plain: string, hashed: string): Promise<boolean> {
    try {
      return await verify(hashed, plain);
    } catch {
      return false;
    }
  }

  needsRehash(hashed: string, config: HashingConfig): boolean {
    const parsed = parseArgonParams(hashed);
    if (!parsed) {
      return false;
    }
    const a = config.argon;
    return (
      parsed.memory !== a.memory ||
      parsed.time !== a.time ||
      parsed.parallelism !== a.threads
    );
  }
}
