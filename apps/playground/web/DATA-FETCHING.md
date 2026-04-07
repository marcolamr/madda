# Dados no client (playground web)

## React Router loaders

Os `loader` das rotas (`homeLoader`, etc.) correm no **SSR** e na **navegação cliente** — boa opção para dados necessários ao primeiro render e para invalidação ao mudar de rota.

## TanStack Query (React Query)

Adoptado para **estado servidor no browser** com cache, refetch e mutations (ex.: `/demo/auth`).

- `QueryProvider` em `app/query-provider.tsx` envolve a árvore em `root-layout.tsx`.
- Pedidos à API usam `credentials: "include"` para enviar o cookie de sessão `httpOnly` (`web/lib/api-client.ts`).

Não guardar segredos em `localStorage` por defeito; o fluxo de demo usa só cookie de sessão.

## Contrato da API

- Tipos e caminhos estáveis: `@madda/contracts` (`v1Paths`, tipos `V1*`).
- Documento OpenAPI gerado: `GET /v1/openapi.json` (controladores com `@RouteSchema`).
- Cliente HTTP leve opcional no monorepo: `@madda/http-client` (`createHttpClient`).
