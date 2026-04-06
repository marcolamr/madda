import type { RedisConnectionContract } from "@madda/redis";
import type { SessionStore } from "./session-store-contract.js";
import type { SessionData } from "./session-types.js";

export class RedisSessionStore implements SessionStore {
  constructor(
    private readonly redis: RedisConnectionContract,
    private readonly keyPrefix: string,
  ) {}

  private key(sessionId: string): string {
    return `${this.keyPrefix}${sessionId}`;
  }

  async read(sessionId: string): Promise<SessionData | null> {
    const raw = await this.redis.get(this.key(sessionId));
    if (raw === null) {
      return null;
    }
    try {
      return JSON.parse(raw) as SessionData;
    } catch {
      return null;
    }
  }

  async write(sessionId: string, data: SessionData, ttlSeconds: number): Promise<void> {
    const payload = JSON.stringify(data);
    if (ttlSeconds <= 0) {
      await this.redis.set(this.key(sessionId), payload);
      return;
    }
    await this.redis.setex(this.key(sessionId), ttlSeconds, payload);
  }

  async destroy(sessionId: string): Promise<void> {
    await this.redis.del(this.key(sessionId));
  }
}
