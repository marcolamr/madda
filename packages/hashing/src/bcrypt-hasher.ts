import bcrypt from "bcryptjs";

import type { HashingConfig } from "./hashing-config.js";

export class BcryptHasher {
  constructor(private readonly opts: HashingConfig["bcrypt"]) {}

  async make(
    plain: string,
    options?: { rounds?: number },
  ): Promise<string> {
    const rounds = options?.rounds ?? this.opts.rounds;
    return bcrypt.hash(plain, rounds);
  }

  async check(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }

  needsRehash(hashed: string, config: HashingConfig): boolean {
    try {
      const rounds = bcrypt.getRounds(hashed);
      return rounds !== config.bcrypt.rounds;
    } catch {
      return true;
    }
  }
}
