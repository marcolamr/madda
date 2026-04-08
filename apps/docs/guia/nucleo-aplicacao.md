# Núcleo da aplicação

O coração de uma app Madda é a instância **`Application`** (`@madda/core`), configurada de forma encadeada e depois materializada com `.create()`.

## Fluxo típico (`bootstrap/app.ts`)

1. Carregar variáveis de ambiente (ex.: `dotenv` no primeiro import).
2. Resolver `basePath` (directório pai de `bootstrap/`).
3. Chamar `Application.configure({ basePath })`.
4. Registar `.withConfig(...)`, `.withRouting(...)`, opcionalmente `.withMiddleware` / `.withExceptions`.
5. Invocar `.create()`.

Exemplo simplificado:

```ts
import { Application } from "@madda/core";
import { createApplicationConfig } from "./config.js";

export const app = Application.configure({ basePath })
  .withConfig(createApplicationConfig())
  .withRouting({
    web: "routes/web.ts",
    commands: "routes/console.ts",
    health: "/up",
  })
  .withMiddleware(() => {
    /* registo global opcional */
  })
  .withExceptions(() => {
    /* handlers opcionais */
  })
  .create();
```

## HttpKernel

O **`HttpKernel`** é responsável por:

1. Criar o servidor HTTP (por defeito via fábrica `createHttpServer` → driver **Fastify**).
2. Fazer bootstrap das rotas web (import dinâmico do módulo indicado em `routing.web`).
3. Chamar `listen(port, host)`.

```ts
import { HttpKernel } from "@madda/core";
import { app } from "../bootstrap/app.js";

const kernel = new HttpKernel(app, {
  /* CreateHttpServerOptions: logger, trustProxy, bodyLimit, prependGlobalMiddleware */
});

await kernel.handle(Number(process.env.PORT ?? 3333));
```

O segundo argumento permite passar opções ao servidor (ex.: `trustProxy: true` atrás de Nginx, `bodyLimit` para limite de corpo).

## ConsoleKernel

O **`ConsoleKernel`** regista comandos built-in (`list`, `help`, `migrate`, …), importa `routes/console.ts` (onde usas `Madda.command` ou `Madda.register`) e despacha o argv.

```ts
import { ConsoleKernel } from "@madda/console";
import { app } from "../bootstrap/app.js";

const kernel = new ConsoleKernel(app);
process.exit(await kernel.handle(process.argv));
```

## Integração play-web

Para registar Vite/SSR **depois** das rotas web Madda, usa o hook opcional do kernel:

```ts
new HttpKernel(app, {}, {
  afterWeb: async (http) => {
    await registerPlayWebDev(http, { webRoot, serverPort: port });
  },
});
```

Assim manténs rotas API Madda e o fallback HTML para o React Router no mesmo `HttpServer`.
