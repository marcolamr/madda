import { argon2i, argon2id } from "argon2";

import { ArgonHasher } from "./argon-hasher.js";
import { BcryptHasher } from "./bcrypt-hasher.js";
import { detectHashDriver } from "./detect-driver.js";
import { HashingDriverMismatchError } from "./errors.js";
import type { HashDriver, HashingConfig } from "./hashing-config.js";

function shouldVerifyForDriver(
  config: HashingConfig,
  driver: HashDriver,
): boolean {
  if (driver === "bcrypt") {
    return config.bcrypt.verify;
  }
  return config.argon.verify;
}

export class HashManager {
  private readonly bcryptHasher: BcryptHasher;

  private readonly argon2iHasher: ArgonHasher;

  private readonly argon2idHasher: ArgonHasher;

  constructor(private readonly config: HashingConfig) {
    this.bcryptHasher = new BcryptHasher(config.bcrypt);
    this.argon2iHasher = new ArgonHasher(config.argon, argon2i);
    this.argon2idHasher = new ArgonHasher(config.argon, argon2id);
  }

  static fromConfig(config: HashingConfig): HashManager {
    return new HashManager(config);
  }

  getConfig(): HashingConfig {
    return this.config;
  }

  async make(
    value: string,
    options?: Record<string, unknown>,
  ): Promise<string> {
    switch (this.config.driver) {
      case "bcrypt":
        return this.bcryptHasher.make(value, {
          rounds: options?.rounds as number | undefined,
        });
      case "argon":
        return this.argon2iHasher.make(value, options as never);
      case "argon2id":
        return this.argon2idHasher.make(value, options as never);
      default: {
        const _exhaustive: never = this.config.driver;
        return _exhaustive;
      }
    }
  }

  async check(value: string, hashed: string): Promise<boolean> {
    const detected = detectHashDriver(hashed);
    if (detected === null) {
      return false;
    }
    if (shouldVerifyForDriver(this.config, detected)) {
      if (detected !== this.config.driver) {
        throw new HashingDriverMismatchError(
          `Hash was created with "${detected}" but the application hashing driver is "${this.config.driver}".`,
        );
      }
    }
    switch (detected) {
      case "bcrypt":
        return this.bcryptHasher.check(value, hashed);
      case "argon":
        return this.argon2iHasher.check(value, hashed);
      case "argon2id":
        return this.argon2idHasher.check(value, hashed);
      default: {
        const _exhaustive: never = detected;
        return _exhaustive;
      }
    }
  }

  needsRehash(hashed: string): boolean {
    const detected = detectHashDriver(hashed);
    if (detected === null) {
      return false;
    }
    if (detected !== this.config.driver) {
      return true;
    }
    switch (detected) {
      case "bcrypt":
        return this.bcryptHasher.needsRehash(hashed, this.config);
      case "argon":
        return this.argon2iHasher.needsRehash(hashed, this.config);
      case "argon2id":
        return this.argon2idHasher.needsRehash(hashed, this.config);
      default: {
        const _exhaustive: never = detected;
        return _exhaustive;
      }
    }
  }
}
