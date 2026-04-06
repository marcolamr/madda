import type { BroadcastEnvelope } from "./broadcast-envelope.js";

export type BroadcastListener = (envelope: BroadcastEnvelope) => void;

/**
 * Hub em memória (processo único). Para várias instâncias usar Redis / serviço externo noutra fase.
 */
export class LocalBroadcastHub {
  private readonly listeners = new Map<string, Set<BroadcastListener>>();

  /**
   * Escuta um canal. `*` recebe todas as publicações (útil para debug).
   */
  subscribe(channel: string, listener: BroadcastListener): () => void {
    const set = this.listeners.get(channel) ?? new Set();
    set.add(listener);
    this.listeners.set(channel, set);
    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(channel);
      }
    };
  }

  publish(channel: string, event: string, data: unknown): void {
    const envelope: BroadcastEnvelope = { channel, event, data };
    this.dispatch(channel, envelope);
    if (channel !== "*") {
      this.dispatch("*", envelope);
    }
  }

  private dispatch(channel: string, envelope: BroadcastEnvelope): void {
    const set = this.listeners.get(channel);
    if (!set) {
      return;
    }
    for (const fn of [...set]) {
      try {
        fn(envelope);
      } catch {
        /* isolamento entre listeners */
      }
    }
  }

  /** Sintaxe fluida: `hub.to('room').emit('Msg', payload)` */
  to(channel: string): { emit: (event: string, data: unknown) => void } {
    return {
      emit: (event: string, data: unknown) => this.publish(channel, event, data),
    };
  }

  listenerCount(channel: string): number {
    return this.listeners.get(channel)?.size ?? 0;
  }
}
