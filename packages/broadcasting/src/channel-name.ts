/** Limite alinhado a nomes de canal tipo Laravel / Pusher (evita DoS por strings enormes). */
export const MAX_BROADCAST_CHANNEL_LENGTH = 255;

const CTRL_OR_WS = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/;

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
  if (CTRL_OR_WS.test(t)) {
    return undefined;
  }
  return t;
}
