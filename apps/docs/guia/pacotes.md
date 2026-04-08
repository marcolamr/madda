# Pacotes do ecossistema

Visão geral dos pacotes publicados no workspace `@madda/*` (todos **private** no monorepo por defeito, exceto ferramentas como `create-madda-app` quando publicadas no npm).

## Núcleo e HTTP

| Pacote | Função |
|--------|--------|
| `@madda/core` | `Application`, `HttpKernel`, `HttpRouter`, integração com config, logging, validação básica. |
| `@madda/http` | Contratos de mensagem HTTP, driver **Fastify**, middlewares utilitários, injeção de testes. |
| `@madda/config` | Tipos e `Config` / `ConfigContract` para árvores tipo Laravel. |
| `@madda/container` | Contentor de injeção de dependências. |
| `@madda/log` | Canais de log estilo Laravel (Pino por baixo). |

## Dados

| Pacote | Função |
|--------|--------|
| `@madda/database` | `DatabaseManager`, ligações SQLite/MySQL/Postgres, contrato de migração. |
| `@madda/pagination` | Paginação de resultados. |
| `@madda/collection` | Coleções utilitárias. |

## Segurança e sessão

| Pacote | Função |
|--------|--------|
| `@madda/encryption` | `Encrypter`, parsing de `APP_KEY` estilo Laravel (`base64:`). |
| `@madda/hashing` | Argon2 / bcrypt via `HashManager`. |
| `@madda/auth` | Middleware de auth (Bearer + sessão), `Gate`, repositório de tokens API. |
| `@madda/cookie` | Parse/serialize de cookies, assinatura HMAC, encriptação opcional. |
| `@madda/session` | Loja de sessão (ficheiro, Redis), middleware com cookie assinado. |

## Infraestrutura

| Pacote | Função |
|--------|--------|
| `@madda/redis` | Adaptador ioredis e fábricas a partir da config. |
| `@madda/cache` | Repositório de cache (ficheiro, array, Redis). |
| `@madda/queue` | Drivers sync, Redis e base de dados; serialização de jobs. |
| `@madda/filesystem` | Sistema de ficheiros local com path confinado à raiz. |
| `@madda/process` | Executar subprocessos (inspirado em `Illuminate\Process`). |

## Comunicação e UI integrada

| Pacote | Função |
|--------|--------|
| `@madda/mail` | Gestor de mail, SMTP, Resend, Mailtrap. |
| `@madda/notifications` | Canais `mail`, `database`, `broadcast`. |
| `@madda/broadcasting` | Hub local, SSE, WebSocket (`ws` + upgrade). |
| `@madda/http-client` | Cliente `fetch` minimal para chamadas de saída. |
| `@madda/play-web` | Registo de Vite em middleware + SSR React Router no Fastify. |

## Consola e contratos

| Pacote | Função |
|--------|--------|
| `@madda/console` | `ConsoleKernel`, `Command`, `Madda.register`, migrações e comandos built-in. |
| `@madda/contracts` | Tipos partilhados entre apps (ex.: caminhos de API). |

## Validação, eventos, suporte

| Pacote | Função |
|--------|--------|
| `@madda/validation` | Validador interno de regras. |
| `@madda/jsonschema` | AJV, decorators de schema em rotas, documento OpenAPI. |
| `@madda/events` | Dispatcher de eventos síncronos. |
| `@madda/bus` | Command bus e pipeline. |
| `@madda/pipeline` | Tubagens reutilizáveis. |
| `@madda/support` | `Stringable`, `Fluent`, macros, helpers. |
| `@madda/reflection` | Metadados `reflect-metadata` partilhados (HTTP, bus, etc.). |
| `@madda/translation` | Carregamento de mensagens por locale. |
| `@madda/view` | Templates texto (ex.: e-mail) alinhados a `fillTemplate`. |
| `@madda/testing` | Utilitários de teste (cache em memória, etc.). |

## Ferramentas de projeto

| Pacote | Função |
|--------|--------|
| `create-madda-app` | CLI publicável (`npx create-madda-app@latest`) para scaffold. |
| `@madda/eslint-config` | ESLint flat config partilhada. |
| `@madda/typescript-config` | Bases de `tsconfig`. |

Para assinaturas exactas, usa a [referência TypeDoc](/api/) filtrando pelo módulo desejado.
