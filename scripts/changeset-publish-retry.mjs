/**
 * Reexecuta `changeset publish` quando o npm devolve rate limit (429).
 * O Changesets só envia pacotes que ainda não estão no registry.
 *
 * Env:
 * - CHANGESET_PUBLISH_MAX_ATTEMPTS (default 15)
 * - CHANGESET_PUBLISH_RETRY_BASE_MS — primeiro intervalo após 429 (default 90_000)
 * - CHANGESET_PUBLISH_RETRY_MAX_MS — teto por espera (default 900_000 = 15 min)
 * - CHANGESET_PUBLISH_RETRY_MS — se definido, intervalo fixo (legado; ignora backoff)
 */
import { spawnSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const maxAttempts = Number(process.env.CHANGESET_PUBLISH_MAX_ATTEMPTS ?? 15);
const fixedLegacyMs = process.env.CHANGESET_PUBLISH_RETRY_MS;
const baseDelayMs = Number(process.env.CHANGESET_PUBLISH_RETRY_BASE_MS ?? 90_000);
const maxDelayMs = Number(process.env.CHANGESET_PUBLISH_RETRY_MAX_MS ?? 900_000);

function isRateLimited(output) {
  return /\b429\b|rate limit|too many requests|Throttl/i.test(output);
}

/** Espera com backoff exponencial + jitter parcial (reduz rajadas sincronizadas). */
function backoffMs(attemptIndex) {
  if (fixedLegacyMs != null && fixedLegacyMs !== "") {
    return Number(fixedLegacyMs);
  }
  const exp = Math.min(maxDelayMs, baseDelayMs * 2 ** attemptIndex);
  // Entre 50% e 100% do valor exponencial
  return Math.floor(exp * (0.5 + Math.random() * 0.5));
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

    const waitMs = backoffMs(i);
    const mode =
      fixedLegacyMs != null && fixedLegacyMs !== "" ? "fixo" : "backoff";
    console.error(
      `\n[changeset-publish-retry] Rate limit (429); modo ${mode}: a aguardar ${Math.round(waitMs / 1000)}s antes da tentativa ${i + 2}/${maxAttempts}…\n`,
    );
    await sleep(waitMs);
  }
}

await main();
