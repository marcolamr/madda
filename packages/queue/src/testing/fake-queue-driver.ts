import type { QueueDriver } from "../queue-driver-contract.js";

/** Driver que apenas regista payloads serializados (sem executar jobs). */
export class FakeQueueDriver implements QueueDriver {
  readonly pushed: string[] = [];

  async push(serializedJob: string): Promise<void> {
    this.pushed.push(serializedJob);
  }
}
