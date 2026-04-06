import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CacheRepository } from "../cache-repository.js";
import { encodeValue, decodeValue } from "../serialize.js";

type Envelope = { exp: number | null; key: string; value: unknown };

const EXT = ".madda-cache";

function hashKey(key: string): string {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

function filePath(root: string, key: string): string {
  return path.join(root, `${hashKey(key)}${EXT}`);
}

export class FileCacheStore implements CacheRepository {
  constructor(private readonly directory: string) {}

  private nowSec(): number {
    return Math.floor(Date.now() / 1000);
  }

  private async readEnvelope(fp: string): Promise<Envelope | undefined> {
    try {
      const raw = await readFile(fp, "utf8");
      return decodeValue<Envelope>(raw);
    } catch {
      return undefined;
    }
  }

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const fp = filePath(this.directory, key);
    const env = await this.readEnvelope(fp);
    if (!env || env.key !== key) {
      return undefined;
    }
    if (env.exp !== null && this.nowSec() >= env.exp) {
      await unlink(fp).catch(() => undefined);
      return undefined;
    }
    return env.value as T;
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const exp =
      ttlSeconds === undefined ? null : this.nowSec() + ttlSeconds;
    const env: Envelope = { exp, key, value };
    await writeFile(filePath(this.directory, key), encodeValue(env), "utf8");
  }

  async forever(key: string, value: unknown): Promise<void> {
    await this.set(key, value);
  }

  async forget(key: string): Promise<boolean> {
    try {
      await unlink(filePath(this.directory, key));
      return true;
    } catch {
      return false;
    }
  }

  async flush(): Promise<void> {
    let names: string[];
    try {
      names = await readdir(this.directory);
    } catch {
      return;
    }
    await Promise.all(
      names
        .filter((n) => n.endsWith(EXT))
        .map((n) => unlink(path.join(this.directory, n)).catch(() => undefined)),
    );
  }

  async flushPrefix(prefix: string): Promise<void> {
    let names: string[];
    try {
      names = await readdir(this.directory);
    } catch {
      return;
    }
    for (const n of names) {
      if (!n.endsWith(EXT)) {
        continue;
      }
      const fp = path.join(this.directory, n);
      const env = await this.readEnvelope(fp);
      if (!env) {
        continue;
      }
      if (env.exp !== null && this.nowSec() >= env.exp) {
        await unlink(fp).catch(() => undefined);
        continue;
      }
      if (env.key.startsWith(prefix)) {
        await unlink(fp).catch(() => undefined);
      }
    }
  }

  async remember<T>(
    key: string,
    ttlSeconds: number,
    callback: () => T | Promise<T>,
  ): Promise<T> {
    const cur = await this.get<T>(key);
    if (cur !== undefined) {
      return cur;
    }
    const v = await callback();
    await this.set(key, v, ttlSeconds);
    return v;
  }

  async many(keys: string[]): Promise<Record<string, unknown>> {
    const out: Record<string, unknown> = {};
    await Promise.all(
      keys.map(async (k) => {
        const v = await this.get(k);
        if (v !== undefined) {
          out[k] = v;
        }
      }),
    );
    return out;
  }

  async putMany(entries: Record<string, unknown>, ttlSeconds?: number): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    for (const [k, v] of Object.entries(entries)) {
      await this.set(k, v, ttlSeconds);
    }
  }
}
