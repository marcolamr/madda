import { QueueConnectionNotFoundError } from "./errors.js";
import type { JobSerializer } from "./job-serializer.js";
import { QueueConnection } from "./queue-connection.js";

export class QueueManager {
  constructor(
    readonly serializer: JobSerializer,
    private readonly defaultName: string,
    private readonly connections: Map<string, QueueConnection>,
  ) {}

  connection(name?: string): QueueConnection {
    const n = name ?? this.defaultName;
    const c = this.connections.get(n);
    if (!c) {
      throw new QueueConnectionNotFoundError(n);
    }
    return c;
  }

  /** Nomes das ligações registadas. */
  connectionNames(): string[] {
    return [...this.connections.keys()];
  }
}
