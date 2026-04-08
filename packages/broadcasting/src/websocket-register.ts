import type { IncomingMessage } from "node:http";
import type { Duplex } from "node:stream";
import type { HttpServer } from "@madda/http";
import type { FastifyInstance } from "fastify";
import { WebSocketServer } from "ws";
import type { BroadcastEnvelope } from "./broadcast-envelope.js";
import { parseBroadcastChannelName } from "./channel-name.js";
import { BroadcastInfrastructureError } from "./errors.js";
import type { LocalBroadcastHub } from "./local-broadcast-hub.js";

export type RegisterBroadcastWebSocketOptions = {
  /**
   * Ignorado — mantido só para compatibilidade. Antes evitava um segundo
   * `app.register(@fastify/websocket)`; o WebSocket passou a usar só `ws` + `upgrade`.
   */
  websocketAlreadyRegistered?: boolean;
};

function asFastifyApp(x: unknown): FastifyInstance | undefined {
  return x && typeof x === "object" && "register" in x && "get" in x
    ? (x as FastifyInstance)
    : undefined;
}

function normalizePath(p: string): string {
  const s = p.startsWith("/") ? p : `/${p}`;
  const t = s.replace(/\/+$/, "");
  return t.length === 0 ? "/" : t;
}

/**
 * WebSocket em `path?channel=...` (mensagens JSON {@link BroadcastEnvelope}).
 *
 * Usa `WebSocketServer` (`ws`) com `noServer: true` e `fastify.server.on("upgrade")`.
 * **Não** usa `@fastify/websocket`: esse plugin regista `onRoute` e envolve **todas** as rotas
 * Fastify, o que na prática fazia `POST` (ex. login) ficar sem resposta com o stack Madda.
 */
export async function registerBroadcastWebSocketRoute(
  server: HttpServer,
  hub: LocalBroadcastHub,
  path: string,
  _options?: RegisterBroadcastWebSocketOptions,
): Promise<void> {
  const app = asFastifyApp(server.nativeApp?.());
  if (!app) {
    throw new BroadcastInfrastructureError(
      "HttpServer.nativeApp() must return FastifyInstance (use Fastify driver from @madda/http).",
    );
  }

  const routePath = normalizePath(path);
  const wss = new WebSocketServer({ noServer: true });

  const onUpgrade = (rawRequest: IncomingMessage, socket: Duplex, head: Buffer): void => {
    try {
      const rawUrl = rawRequest.url;
      if (!rawUrl) {
        return;
      }
      const pathname = normalizePath(new URL(rawUrl, "http://localhost").pathname);
      if (pathname !== routePath) {
        return;
      }

      wss.handleUpgrade(rawRequest, socket, head, (ws) => {
        const url = new URL(rawUrl, "http://localhost");
        const channel = parseBroadcastChannelName(url.searchParams.get("channel") ?? undefined);
        if (!channel) {
          ws.close(1008, "valid channel query required");
          return;
        }

        const unsub = hub.subscribe(channel, (envelope: BroadcastEnvelope) => {
          try {
            ws.send(JSON.stringify(envelope));
          } catch {
            /* closed */
          }
        });

        ws.on("close", unsub);
      });
    } catch {
      socket.destroy();
    }
  };

  app.server.on("upgrade", onUpgrade);

  app.addHook("onClose", (_instance, done) => {
    app.server.off("upgrade", onUpgrade);
    wss.close((err) => {
      if (err) {
        app.log.warn({ err }, "broadcasting: websocket server close");
      }
      done();
    });
  });
}
