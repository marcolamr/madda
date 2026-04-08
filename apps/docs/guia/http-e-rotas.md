# HTTP, rotas e middlewares

## Servidor e mensagens

O driver **Fastify** adapta pedidos para o contrato **`HttpRequest`** / **`HttpReply`** (`@madda/http`): método, path, query, params, corpo, cabeçalhos e estado por pedido (`ctx.state`).

## Middleware global

```ts
server.use(async (ctx, next) => {
  ctx.log.info({ path: ctx.request.path }, "hit");
  await next();
});
```

A ordem de registo é a ordem de execução. Coloca **sessão** antes de **auth** se usares utilizador na sessão.

## HttpRouter

Agrupa prefixos e middlewares por grupo:

```ts
import { HttpRouter } from "@madda/core";
import { requireAuthMiddleware } from "@madda/auth";

const r = new HttpRouter(server);

r.get("/", (ctx) => {
  ctx.reply.status(200).json({ ok: true });
});

r.group({ prefix: "v1", middleware: [requireAuthMiddleware()] }, (g) => {
  g.get("/me", (ctx) => {
    ctx.reply.json({ user: ctx.state["madda.auth.user"] });
  });
});
```

## Controllers e OpenAPI

Podes registar classes com decorators (`@Controller`, `@Get`, `@Post`, …) e **`@RouteSchema`** (JSON Schema) para validação automática e agregação OpenAPI:

```ts
import { registerController } from "@madda/http";

registerController(server, [MeController, OrderController], {
  prefix: "v1",
  container: optionalContainer,
});
```

Erros de validação (`JsonSchemaValidationError`) são normalmente mapeados para **400** pelo error handler por defeito.

## Segurança recomendada

- Cookies de sessão: `httpOnly`, `sameSite`, `secure` em produção (ver `@madda/session` + config).
- `trustProxy` e `bodyLimit` no `HttpKernel` quando estiveres atrás de proxy ou exposto à Internet.
- Middleware opcional de **cabeçalhos de segurança** (`securityHeadersMiddleware` em `@madda/http`).

## Integração com play-web

Pedidos `GET`/`HEAD` são primeiro tratados pelo stack Vite (ficheiros estáticos e HMR). Rotas API (ex.: `/v1/...`) continuam a ser servidas pelo router Madda. Documentação detalhada: [play-web](./play-web.md).
