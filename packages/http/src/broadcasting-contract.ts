/**
 * Contrato HTTP para tempo real com `@madda/broadcasting`.
 *
 * ## Subscrição
 *
 * - **SSE:** rota `GET` (ex. `/broadcast/sse?channel=orders.1`). O cliente usa `EventSource`.
 *   Resposta `text/event-stream` com `event:` + `data:` (JSON).
 * - **WebSocket:** rota com upgrade (ex. `/broadcast/ws?channel=orders.1`). Cliente `WebSocket`
 *   no browser ou `apps/web` (ver BACKLOG — Frontend — tempo real).
 *
 * ## Entrega (servidor → cliente)
 *
 * Um `LocalBroadcastHub` recebe `publish(channel, event, data)`; clientes nesse canal recebem
 * JSON `{ event, data, channel }`.
 *
 * ## Handles nativos
 *
 * Com **Fastify**, `HttpRequest.driverRequest` é `FastifyRequest`, `HttpReply.driverReply` é
 * `FastifyReply`, e `HttpServer.nativeApp()` devolve `FastifyInstance` (para `@fastify/websocket`).
 *
 * @module
 */
export const BROADCASTING_HTTP_CONTRACT_VERSION = 1 as const;
