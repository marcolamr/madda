import type { HashManager } from "@madda/hashing";

let hashManager: HashManager | undefined;

export function setHashManager(manager: HashManager | undefined): void {
  hashManager = manager;
}

export function getHashManagerOrThrow(): HashManager {
  if (!hashManager) {
    throw new Error(
      "Password hashing is not configured. Publish config with: pnpm madda config:publish hashing",
    );
  }
  return hashManager;
}
