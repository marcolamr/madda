import type { RedisConnectionContract } from "./redis-connection-contract.js";

export type RedisHealthResult =
  | { ok: true; latencyMs: number }
  | { ok: false; error: string };

export async function redisHealthCheck(conn: RedisConnectionContract): Promise<RedisHealthResult> {
  const t0 = performance.now();
  try {
    await conn.ping();
    return { ok: true, latencyMs: performance.now() - t0 };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
