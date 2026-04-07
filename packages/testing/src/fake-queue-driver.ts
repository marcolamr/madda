import type { QueueDriver } from "@madda/queue";

/** Driver que apenas regista payloads serializados (sem executar jobs). */
export class FakeQueueDriver implements QueueDriver {
  readonly pushed: string[] = [];

  async push(serializedJob: string): Promise<void> {
    this.pushed.push(serializedJob);
  }
}
