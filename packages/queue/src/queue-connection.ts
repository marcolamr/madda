import { QueueReserveNotSupportedError } from "./errors.js";
import type { JobContext } from "./job-context.js";
import type { JobSerializer } from "./job-serializer.js";
import type { QueueDriver } from "./queue-driver-contract.js";

export class QueueConnection {
  constructor(
    private readonly name: string,
    private readonly driver: QueueDriver,
    private readonly serializer: JobSerializer,
    private readonly makeContext: () => JobContext,
  ) {}

  /** Nome desta ligação em `queue.connections`. */
  get connectionName(): string {
    return this.name;
  }

  async dispatchPayload(type: string, payload: unknown): Promise<void> {
    const raw = this.serializer.stringify(type, payload);
    await this.driver.push(raw);
  }

  async dispatch(job: { readonly jobType: string; toPayload(): unknown }): Promise<void> {
    return this.dispatchPayload(job.jobType, job.toPayload());
  }

  /**
   * Obtém e executa um job (worker). Só para drivers com `reserve` (Redis, database).
   */
  async workOnce(timeoutSeconds = 5): Promise<boolean> {
    const reserve = this.driver.reserve;
    if (!reserve) {
      throw new QueueReserveNotSupportedError(this.name);
    }
    const raw = await reserve.call(this.driver, timeoutSeconds);
    if (raw === null) {
      return false;
    }
    await this.serializer.run(raw, this.makeContext());
    return true;
  }
}
