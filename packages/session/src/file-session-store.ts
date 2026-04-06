import { createHash } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SessionStore } from "./session-store-contract.js";
import type { SessionData } from "./session-types.js";

const EXT = ".sess";

type Envelope = { exp: number | null; payload: SessionData };

function hashId(sessionId: string): string {
  return createHash("sha256").update(sessionId, "utf8").digest("hex");
}

function filePath(root: string, sessionId: string): string {
  return path.join(root, `${hashId(sessionId)}${EXT}`);
}

export class FileSessionStore implements SessionStore {
  constructor(private readonly directory: string) {}

  private nowSec(): number {
    return Math.floor(Date.now() / 1000);
  }

  private async readEnvelope(fp: string): Promise<Envelope | undefined> {
    try {
      const raw = await readFile(fp, "utf8");
      return JSON.parse(raw) as Envelope;
    } catch {
      return undefined;
    }
  }

  async read(sessionId: string): Promise<SessionData | null> {
    const env = await this.readEnvelope(filePath(this.directory, sessionId));
    if (!env) {
      return null;
    }
    if (env.exp !== null && this.nowSec() >= env.exp) {
      await unlink(filePath(this.directory, sessionId)).catch(() => undefined);
      return null;
    }
    return env.payload ?? {};
  }

  async write(sessionId: string, data: SessionData, ttlSeconds: number): Promise<void> {
    await mkdir(this.directory, { recursive: true });
    const exp = ttlSeconds <= 0 ? null : this.nowSec() + ttlSeconds;
    const env: Envelope = { exp, payload: data };
    await writeFile(filePath(this.directory, sessionId), JSON.stringify(env), "utf8");
  }

  async destroy(sessionId: string): Promise<void> {
    try {
      await unlink(filePath(this.directory, sessionId));
    } catch {
      /* ignore */
    }
  }
}
