# Broadcasting em tempo real

## LocalBroadcastHub

`@madda/broadcasting` oferece um hub **em memória** para desenvolvimento e testes: publicas *envelopes* JSON e os subscritores (SSE ou WebSocket) recebem.

## SSE

`createSseBroadcastRouteHandler` regista um `GET` que mantém *text/event-stream*, com *ping* opcional e presença em memória (`MemoryPresenceStore`) se configurares.

## WebSocket

`registerBroadcastWebSocketRoute` usa `ws` com `noServer: true` e escuta `upgrade` no `http.Server` do Fastify — evita envolver todas as rotas com `@fastify/websocket`, o que quebrava POSTs nalguns cenários.

## Segurança

- Valida nomes de canal (comprimento e caracteres) nos handlers incluídos.
- Em produção, **autoriza subscrições** (ex.: token na query assinado, ou sessão validada no *upgrade*) — o stack base não impõe auth nos canais por defeito.

## Registo

`registerBroadcastingRoutes(server, hub, { config, sse, ws })` alinha caminhos com `BroadcastingConfigShape`.
