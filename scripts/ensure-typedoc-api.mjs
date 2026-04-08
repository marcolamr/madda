/**
 * Garante `apps/docs/public/api/index.html` antes de `vitepress dev`.
 * A pasta está no .gitignore; sem isto, /api/ dá 404 após clone ou clean.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiIndex = join(root, "apps", "docs", "public", "api", "index.html");

if (!existsSync(apiIndex)) {
  console.info("[docs] Saída TypeDoc em falta; a executar pnpm run docs:api …");
  const result = spawnSync("pnpm", ["run", "docs:api"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
