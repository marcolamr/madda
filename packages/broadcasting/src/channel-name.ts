/** Limite alinhado a nomes de canal tipo Laravel / Pusher (evita DoS por strings enormes). */
export const MAX_BROADCAST_CHANNEL_LENGTH = 255;

/** Rejeita C0 menos TAB/LF/CR (alinhado ao regex anterior; evita `no-control-regex` no ESLint). */
function hasDisallowedControlOrDel(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c <= 0x08) {
      return true;
    }
    if (c === 0x0b || c === 0x0c) {
      return true;
    }
    if (c >= 0x0e && c <= 0x1f) {
      return true;
    }
    if (c === 0x7f) {
      return true;
    }
  }
  return false;
}

/**
 * Valida o nome do canal (query `channel` em SSE/WS). Retorna `undefined` se inválido.
 */
export function parseBroadcastChannelName(raw: string | undefined): string | undefined {
  const t = raw?.trim();
  if (!t) {
    return undefined;
  }
  if (t.length > MAX_BROADCAST_CHANNEL_LENGTH) {
    return undefined;
  }
  if (hasDisallowedControlOrDel(t)) {
    return undefined;
  }
  return t;
}
