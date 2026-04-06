import type { BroadcastEnvelope } from "./broadcast-envelope.js";

/** Alinha com WebSocket: `data` é JSON do envelope completo (`channel`, `event`, `data`). */
export function encodeSseMessage(envelope: BroadcastEnvelope): string {
  return `event: ${envelope.event}\ndata: ${JSON.stringify(envelope)}\n\n`;
}
