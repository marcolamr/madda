import type { JobContext } from "./job-context.js";
import type { JobSerializer } from "./job-serializer.js";
import type { QueueDriver } from "./queue-driver-contract.js";

/**
 * Executa o job no mesmo processo assim que é despachado (equivalente a `QUEUE_CONNECTION=sync`).
 */
export class SyncQueueDriver implements QueueDriver {
  constructor(
    private readonly serializer: JobSerializer,
    private readonly makeContext: () => JobContext,
  ) {}

  async push(serializedJob: string): Promise<void> {
    await this.serializer.run(serializedJob, this.makeContext());
  }
}
