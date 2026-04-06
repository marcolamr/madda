import type { Dispatcher, EventKey } from "@madda/events";
import type { QueueManager } from "./queue-manager.js";

/**
 * Regista um listener de eventos que despacha um job na fila (fire-and-forget).
 */
export function listenQueued(
  dispatcher: Dispatcher,
  event: EventKey,
  map: (payload: unknown) => { type: string; payload: unknown },
  queues: QueueManager,
  connection?: string,
): void {
  dispatcher.listen(event, (payload: unknown) => {
    const job = map(payload);
    void queues.connection(connection).dispatchPayload(job.type, job.payload);
  });
}
