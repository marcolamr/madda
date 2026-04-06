import type { HttpServer } from "@madda/http";
import websocket from "@fastify/websocket";
import type { FastifyInstance } from "fastify";
import type { BroadcastEnvelope } from "./broadcast-envelope.js";
import { BroadcastInfrastructureError } from "./errors.js";
import type { LocalBroadcastHub } from "./local-broadcast-hub.js";

export type RegisterBroadcastWebSocketOptions = {
  /** Se já registaste `@fastify/websocket` na mesma app, passa `true`. */
  websocketAlreadyRegistered?: boolean;
};

function asFastifyApp(x: unknown): FastifyInstance | undefined {
  return x && typeof x === "object" && "register" in x && "get" in x ? (x as FastifyInstance) : undefined;
}

/**
 * Regista rota WebSocket `GET path?channel=...`. Mensagens ao cliente: JSON {@link BroadcastEnvelope}.
 */
export async function registerBroadcastWebSocketRoute(
  server: HttpServer,
  hub: LocalBroadcastHub,
  path: string,
  options?: RegisterBroadcastWebSocketOptions,
): Promise<void> {
  const app = asFastifyApp(server.nativeApp?.());
  if (!app) {
    throw new BroadcastInfrastructureError(
      "HttpServer.nativeApp() must return FastifyInstance (use Fastify driver from @madda/http).",
    );
  }

  if (!options?.websocketAlreadyRegistered) {
    await app.register(websocket);
  }

  app.get(path, { websocket: true }, (socketConn, req) => {
    const url = req.url ? new URL(req.url, "http://localhost") : null;
    const channel = url?.searchParams.get("channel")?.trim();
    if (!channel) {
      socketConn.socket.close(1008, "channel query required");
      return;
    }

    const unsub = hub.subscribe(channel, (envelope: BroadcastEnvelope) => {
      try {
        socketConn.socket.send(JSON.stringify(envelope));
      } catch {
        /* closed */
      }
    });

    socketConn.socket.on("close", unsub);
  });
}
