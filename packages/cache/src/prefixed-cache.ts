import type { CacheRepository } from "./cache-repository.js";

function normPrefix(prefix: string | undefined): string {
  if (!prefix) {
    return "";
  }
  return prefix.endsWith(":") ? prefix : `${prefix}:`;
}

export function withKeyPrefix(inner: CacheRepository, prefix: string | undefined): CacheRepository {
  const p = normPrefix(prefix);
  if (p === "") {
    return inner;
  }
  return {
    get: (k) => inner.get(p + k),
    set: (k, v, t) => inner.set(p + k, v, t),
    forever: (k, v) => inner.forever(p + k, v),
    forget: (k) => inner.forget(p + k),
    flush: () => (p === "" ? inner.flush() : inner.flushPrefix(p)),
    flushPrefix: (px) => inner.flushPrefix(p + px),
    remember: (k, t, cb) => inner.remember(p + k, t, cb),
    many: async (keys) => {
      const full = keys.map((k) => p + k);
      const got = await inner.many(full);
      const out: Record<string, unknown> = {};
      keys.forEach((k, i) => {
        const fk = full[i]!;
        if (Object.prototype.hasOwnProperty.call(got, fk)) {
          out[k] = got[fk];
        }
      });
      return out;
    },
    putMany: (entries, ttl) => {
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(entries)) {
        next[p + k] = v;
      }
      return inner.putMany(next, ttl);
    },
  };
}
