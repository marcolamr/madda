import type { RedisConnectionContract } from "@madda/redis";
import type { QueueDriver } from "./queue-driver-contract.js";

export class RedisQueueDriver implements QueueDriver {
  constructor(
    private readonly redis: RedisConnectionContract,
    private readonly listKey: string,
  ) {}

  async push(serializedJob: string): Promise<void> {
    await this.redis.rpush(this.listKey, serializedJob);
  }

  async reserve(timeoutSeconds: number): Promise<string | null> {
    const out = await this.redis.blpop([this.listKey], timeoutSeconds);
    return out?.value ?? null;
  }
}
