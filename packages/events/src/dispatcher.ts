import type { ContainerResolutionContract } from "@madda/container";
import type { Token } from "@madda/container";
import { ListenerMissingHandleError, ListenerRequiresContainerError } from "./errors.js";
import { isConstructor } from "./is-constructor.js";

/** Chave por nome (string) ou pelo construtor do evento (classe). */
export type EventKey = string | (abstract new (...args: unknown[]) => unknown);

export type SyncEventListener =
  | ((event: unknown) => void)
  | (abstract new (...args: unknown[]) => unknown);

/**
 * Dispatcher síncrono — equivalente mental a `Illuminate\Events\Dispatcher` (sem fila).
 */
export class Dispatcher {
  private readonly listeners = new Map<EventKey, SyncEventListener[]>();

  constructor(private readonly container?: ContainerResolutionContract) {}

  listen(key: EventKey, listener: SyncEventListener): this {
    const list = this.listeners.get(key) ?? [];
    list.push(listener);
    this.listeners.set(key, list);
    return this;
  }

  /** Remove todos os listeners da chave, ou só uma entrada concreta. */
  forget(key: EventKey, listener?: SyncEventListener): this {
    if (listener === undefined) {
      this.listeners.delete(key);
      return this;
    }
    const list = this.listeners.get(key);
    if (!list) {
      return this;
    }
    const next = list.filter((l) => l !== listener);
    if (next.length === 0) {
      this.listeners.delete(key);
    } else {
      this.listeners.set(key, next);
    }
    return this;
  }

  hasListeners(key: EventKey): boolean {
    return (this.listeners.get(key)?.length ?? 0) > 0;
  }

  /** Dispara evento por nome com payload opcional. */
  emit(name: string, payload?: unknown): void;

  /** Dispara instância: listeners registados pelo `constructor` do objeto. */
  emit(event: object): void;

  emit(nameOrEvent: string | object, payload?: unknown): void {
    if (typeof nameOrEvent === "string") {
      this.runListeners(nameOrEvent, payload);
      return;
    }
    const ctor = nameOrEvent.constructor as abstract new (...args: unknown[]) => unknown;
    this.runListeners(ctor, nameOrEvent);
  }

  clear(): void {
    this.listeners.clear();
  }

  private runListeners(key: EventKey, payload: unknown): void {
    const list = this.listeners.get(key) ?? [];
    for (const listener of [...list]) {
      this.invoke(listener, payload);
    }
  }

  private invoke(listener: SyncEventListener, event: unknown): void {
    if (!isConstructor(listener)) {
      (listener as (e: unknown) => void)(event);
      return;
    }
    if (!this.container) {
      throw new ListenerRequiresContainerError(listener.name);
    }
    const instance = this.container.get(listener as Token);
    const handle = (instance as { handle?: (e: unknown) => void }).handle;
    if (typeof handle !== "function") {
      throw new ListenerMissingHandleError(listener.name);
    }
    handle.call(instance, event);
  }
}
