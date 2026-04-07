import { Dispatcher } from "./dispatcher.js";

export type DispatchRecord =
  | { kind: "string"; name: string; payload: unknown }
  | { kind: "event"; event: object };

/** `Dispatcher` que grava cada `emit` antes de delegar (útil em testes). */
export class RecordingDispatcher extends Dispatcher {
  readonly records: DispatchRecord[] = [];

  override emit(name: string, payload?: unknown): void;
  override emit(event: object): void;
  override emit(nameOrEvent: string | object, payload?: unknown): void {
    if (typeof nameOrEvent === "string") {
      this.records.push({ kind: "string", name: nameOrEvent, payload });
      super.emit(nameOrEvent, payload);
      return;
    }
    this.records.push({ kind: "event", event: nameOrEvent });
    super.emit(nameOrEvent);
  }
}
