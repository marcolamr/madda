/**
 * Presença mínima em memória por canal (ex.: utilizadores ligados).
 * Não é thread-safe entre workers; combinar com sticky sessions ou store partilhado depois.
 */
export class MemoryPresenceStore {
  private readonly byChannel = new Map<string, Map<string, Record<string, unknown>>>();

  join(channel: string, memberId: string, meta: Record<string, unknown> = {}): void {
    let m = this.byChannel.get(channel);
    if (!m) {
      m = new Map();
      this.byChannel.set(channel, m);
    }
    m.set(memberId, { ...meta });
  }

  leave(channel: string, memberId: string): void {
    this.byChannel.get(channel)?.delete(memberId);
  }

  members(channel: string): Array<{ id: string; meta: Record<string, unknown> }> {
    const m = this.byChannel.get(channel);
    if (!m) {
      return [];
    }
    return [...m.entries()].map(([id, meta]) => ({ id, meta }));
  }

  count(channel: string): number {
    return this.byChannel.get(channel)?.size ?? 0;
  }
}
