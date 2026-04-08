# play-web — React + Vite no mesmo servidor

## Ideia

`@madda/play-web` regista o **middleware Vite** em modo desenvolvimento no hook Fastify correcto (`onRequest`), e um **`notFoundHandler`** que:

1. Para `GET`/`HEAD` que pedem HTML, lê `web/index.html`.
2. Pede ao Vite `transformIndexHtml`.
3. Carrega `entry-server.tsx` via `ssrLoadModule` e chama `render(url)`.
4. Substitui `<!--ssr-outlet-->` pelo HTML renderizado.

No **cliente**, `entry-client.tsx` faz *hydration* com `createBrowserRouter(routes)`.

## Convenção de pastas

```
web/
  app/           # "pages" e layouts (convénio tipo App Router)
  entry-client.tsx
  entry-server.tsx
  routes.tsx     # árvore RouteObject
  vite.config.ts
  index.html
```

## Loaders (mental model Next.js)

Funções `loader` exportadas nos `RouteObject` correm:

- No **SSR** (servidor Node ao renderizar HTML).
- No **cliente** nas navegações subsequentes (React Router data APIs).

Evita `fetch` ao próprio servidor no SSR para dados que já estão no processo (usa chamadas directas a serviços / DB quando fizer sentido).

## Variáveis e ambiente

Usa `loadEnv` / `define` no Vite para expor ao *browser* apenas o que for seguro (ex.: locale público). Nunca exposes segredos em `define`.

## Produção

O caminho de *build* para produção (ficheiros estáticos + SSR sem middleware Vite) é uma evolução natural: podes servir `dist/client` e um bundle SSR separado; o playground hoje foca **dev integrado** — adapta o teu pipeline CI/CD conforme necessário.

## Leitura extra

- Código: `packages/play-web/src/register-play-web-dev.ts`
- Exemplo completo: `apps/playground/web/`
