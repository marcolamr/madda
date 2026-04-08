import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

/**
 * Sobe directórios até encontrar `pnpm-workspace.yaml` com `packages/*` (monorepo Madda).
 */
export function findMaddaMonorepoRoot(startDir: string): string | null {
  let dir = resolve(startDir);
  for (;;) {
    const marker = join(dir, "pnpm-workspace.yaml");
    if (existsSync(marker)) {
      try {
        const raw = readFileSync(marker, "utf8");
        if (raw.includes("packages/*") && raw.includes("apps/*")) {
          return dir;
        }
      } catch {
        /* ignore */
      }
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}
