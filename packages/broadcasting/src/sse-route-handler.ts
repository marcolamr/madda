import type { HttpContext, RouteHandler } from "@madda/http";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { BroadcastEnvelope } from "./broadcast-envelope.js";
import { parseBroadcastChannelName } from "./channel-name.js";
import type { LocalBroadcastHub } from "./local-broadcast-hub.js";
import type { MemoryPresenceStore } from "./presence-memory.js";
import { encodeSseMessage } from "./sse-encode.js";

export type SseBroadcastRouteOptions = {
  hub: LocalBroadcastHub;
  /** Nome do query param do canal (por defeito `channel`). */
  channelQueryParam?: string;
  /** Comentário periódico para manter proxies vivos (0 = desliga). */
  pingMs?: number;
  /** Se definido, regista presença com esta chave. */
  presence?: MemoryPresenceStore;
  /** Obrigatório com `presence`: id do membro ou função (ex. sessão em `ctx.state`). */
  presenceMemberId?: string | ((ctx: HttpContext) => string | undefined);
};

function asFastifyReply(x: unknown): FastifyReply | undefined {
  return x && typeof x === "object" && "raw" in x && "hijack" in x ? (x as FastifyReply) : undefined;
}

function asFastifyRequest(x: unknown): FastifyRequest | undefined {
  return x && typeof x === "object" && "raw" in x ? (x as FastifyRequest) : undefined;
}

/**
 * `RouteHandler` para `GET` SSE. Exige driver Fastify (`driverReply` com `hijack` + `raw`).
 */
export function createSseBroadcastRouteHandler(options: SseBroadcastRouteOptions): RouteHandler {
  const param = options.channelQueryParam ?? "channel";
  const pingMs = options.pingMs ?? 25_000;

  return async (ctx) => {
    const fq = asFastifyReply(ctx.reply.driverReply);
    const frq = asFastifyRequest(ctx.request.driverRequest);
    if (!fq?.hijack || !fq.raw) {
      ctx.log.warn("broadcasting.sse: Fastify driverReply missing hijack/raw");
      ctx.reply.status(501).send("SSE requires Fastify (driverReply.hijack)");
      return;
    }

    const channel = parseBroadcastChannelName(ctx.request.query[param]);
    if (!channel) {
      ctx.reply.status(400).json({ error: `Query ?${param}= is required (valid channel name)` });
      return;
    }

    const resolveMemberId = (): string | undefined => {
      const p = options.presenceMemberId;
      if (typeof p === "function") {
        return p(ctx)?.trim();
      }
      return p?.trim();
    };
    const memberId = resolveMemberId();

    if (options.presence !== undefined && !memberId) {
      ctx.reply.status(500).json({ error: "presenceMemberId is required when presence is set" });
      return;
    }

    fq.hijack();
    fq.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    const write = (chunk: string) => {
      try {
        fq.raw.write(chunk);
      } catch {
        /* socket closed */
      }
    };

    write(": connected\n\n");

    const { presence } = options;
    if (presence !== undefined && memberId) {
      presence.join(channel, memberId, { transport: "sse" });
    }

    const push = (envelope: BroadcastEnvelope) => {
      write(encodeSseMessage(envelope));
    };

    const unsubscribe = options.hub.subscribe(channel, push);

    const ping =
      pingMs > 0
        ? setInterval(() => {
            write(`: ping ${Date.now()}\n\n`);
          }, pingMs)
        : null;

    const cleanup = () => {
      if (ping) {
        clearInterval(ping);
      }
      unsubscribe();
      if (presence !== undefined && memberId) {
        presence.leave(channel, memberId);
      }
    };

    const socket = frq?.raw?.socket;
    socket?.once("close", cleanup);
    frq?.raw?.once("close", cleanup);
  };
}
