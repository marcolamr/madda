# Início rápido

## Requisitos

- **Node.js** ≥ 18
- **pnpm** 9.x (definido em `packageManager` na raiz do monorepo)

## Clonar e instalar

```bash
git clone <seu-repositorio> madda
cd madda
pnpm install
```

O workspace inclui `apps/*` e `packages/*`. O pacote `create-madda-app` gera novas aplicações com dependências `workspace:*` para `@madda/*`.

## Criar uma nova aplicação

Na raiz do monorepo:

```bash
pnpm create-app
```

Ou, após compilar o CLI:

```bash
pnpm --filter create-madda-app build
node packages/create-madda-app/dist/cli.js apps/minha-app --template full --package @madda/minha-app
```

**Templates:**

| Template | Conteúdo |
|----------|-----------|
| `api` | Servidor HTTP + consola, sem base de dados nem front. |
| `api-db` | Como `api` + SQLite e `bootstrapDatabase`. |
| `full` | Como `api-db` + React + Vite SSR (`@madda/play-web`). |

Depois:

```bash
pnpm install          # na raiz, se ainda não correste
cd apps/minha-app
cp .env.example .env
pnpm madda key:generate
pnpm madda migrate    # templates com base de dados
pnpm dev
```

- **API:** abre `http://127.0.0.1:3333/` (ou a rota que definires).
- **full:** o mesmo porto serve API e páginas Vite/SSR; exemplos usam `GET /v1/ping`.

## Estrutura típica de uma app

```
apps/minha-app/
  bootstrap/        # app.ts, config agregado, base de dados
  config/           # app.ts, database.ts, session.ts, …
  routes/
    web.ts          # registo de rotas HTTP
    console.ts      # Madda.command(...)
  src/
    main.ts         # HttpKernel + listen
    madda.ts        # ConsoleKernel + argv
  database/migrations/
  web/              # só no template full — React + Vite
```

## Desenvolvimento do monorepo

```bash
pnpm build            # turbo: compila pacotes
pnpm check-types
pnpm test
pnpm lint
```

## Documentação local

```bash
pnpm docs:dev
```

Abre o site VitePress. A pasta `public/api/` com o TypeDoc é gerada com:

```bash
pnpm docs:api
```

(Recomendado antes de `pnpm docs:build` em CI.)
