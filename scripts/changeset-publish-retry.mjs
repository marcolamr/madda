/**
 * Reexecuta `changeset publish` com pausa quando o npm devolve rate limit (429).
 * O Changesets já publicou parte dos pacotes; a tentativa seguinte só envia os que ainda não estão no registry.
 */
import { spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const maxAttempts = Number(process.env.CHANGESET_PUBLISH_MAX_ATTEMPTS ?? 10);
const delayMs = Number(process.env.CHANGESET_PUBLISH_RETRY_MS ?? 120_000);

function isRateLimited(output) {
  return /\b429\b|rate limit|too many requests|Throttl/i.test(output);
}

async function main() {
  for (let i = 0; i < maxAttempts; i++) {
    const r = spawnSync("pnpm", ["exec", "changeset", "publish"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      stdio: ["inherit", "pipe", "pipe"],
    });
    const stdout = r.stdout ?? "";
    const stderr = r.stderr ?? "";
    process.stdout.write(stdout);
    process.stderr.write(stderr);

    if (r.status === 0) {
      process.exit(0);
    }

    const combined = `${stdout}\n${stderr}`;
    const rate = isRateLimited(combined);
    if (!rate || i === maxAttempts - 1) {
      process.exit(r.status ?? 1);
    }

    console.error(
      `\n[changeset-publish-retry] Rate limit (429); a aguardar ${delayMs / 1000}s antes da tentativa ${i + 2}/${maxAttempts}…\n`,
    );
    await sleep(delayMs);
  }
}

await main();
