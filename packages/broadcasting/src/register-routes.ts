import type { BroadcastingConfigShape } from "@madda/config";
import type { HttpServer } from "@madda/http";
import type { LocalBroadcastHub } from "./local-broadcast-hub.js";
import { createSseBroadcastRouteHandler, type SseBroadcastRouteOptions } from "./sse-route-handler.js";
import {
  registerBroadcastWebSocketRoute,
  type RegisterBroadcastWebSocketOptions,
} from "./websocket-register.js";

const DEFAULT_SSE = "/broadcast/sse";
const DEFAULT_WS = "/broadcast/ws";

export type RegisterBroadcastingRoutesOptions = {
  config?: Partial<BroadcastingConfigShape>;
  sse?: Omit<SseBroadcastRouteOptions, "hub">;
  ws?: RegisterBroadcastWebSocketOptions;
};

/**
 * Regista SSE (`GET`) e WebSocket com caminhos de `config` ou valores por defeito.
 */
export async function registerBroadcastingRoutes(
  server: HttpServer,
  hub: LocalBroadcastHub,
  options?: RegisterBroadcastingRoutesOptions,
): Promise<void> {
  const ssePath = options?.config?.sse_path ?? DEFAULT_SSE;
  const wsPath = options?.config?.ws_path ?? DEFAULT_WS;

  server.get(ssePath, createSseBroadcastRouteHandler({ hub, ...options?.sse }));
  await registerBroadcastWebSocketRoute(server, hub, wsPath, options?.ws);
}
