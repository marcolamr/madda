# `@madda/http` — ordem de middlewares e extensões

O servidor exposto por `createHttpServer` / `HttpKernel` é um `HttpServer`: `use(middleware)` regista **middleware global** (ordem de registo = ordem de execução, antes de cada rota).

## Padrão recomendado (web com sessão + auth)

1. **Sessão** — `createSessionMiddleware` ou `createSessionMiddlewareFromConfig` (`@madda/session`). Lê o cookie assinado, preenche `ctx.state['madda.session']`, envia `Set-Cookie` no hook Fastify `onSend` (via `HTTP_BEFORE_SEND_STATE_KEY`) e faz fallback no `finally` se não houve resposta normal (ex.: hijack). Requer `app.key` (`APP_KEY`) para assinar o id da sessão.
2. **Auth** — `createAuthMiddleware` / `createAuthMiddlewareFromConfig` (`@madda/auth`), normalmente com `optional: true` globalmente. Resolve Bearer e/ou utilizador na sessão (`trySessionFromContext`) e preenche `ctx.state` (`madda.auth.user`, `madda.auth.via`). **Tem de correr depois da sessão** se usar `useSession: true`.
3. **Rotas** — `routes/web.ts`, controllers (`registerController`), `HttpRouter`.
4. **Broadcasting** (opcional) — `registerBroadcastingRoutes` (`@madda/broadcasting`) com um `LocalBroadcastHub` (ou adaptador partilhado em produção). Usa `server.nativeApp()` para WebSocket (`@fastify/websocket`). Contrato HTTP: [`broadcasting-contract.ts`](src/broadcasting-contract.ts).

Rotas que exigem utilizador: agrupar com `requireAuthMiddleware()` **depois** do auth opcional global (ex. `HttpRouter.group({ middleware: [requireAuthMiddleware()] })`).

## Auth sem sessão (só API token)

`createAuthMiddleware({ tokenRepository, useSession: false })` — sem passo 1 se não houver cookie de sessão.

## Referências

- [`@madda/session`](../session) — `createSessionMiddlewareFromConfig`
- [`@madda/auth`](../auth) — `createAuthMiddlewareFromConfig`, `requireAuthMiddleware`, `sessionLogin`, `attemptSessionLogin`, `sessionLogout`
- [`@madda/broadcasting`](../broadcasting) — `registerBroadcastingRoutes`, `LocalBroadcastHub`

## Cliente HTTP de saída

Pacote opcional [`@madda/http-client`](../http-client) — `createHttpClient` em cima de `fetch` (sem stack paralela ao servidor).
