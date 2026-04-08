# Configuração

## Forma mental (Laravel)

Cada domínio tem um módulo em `config/` (`app.ts`, `database.ts`, `session.ts`, …). O **`bootstrap/config.ts`** agrega tudo numa instância **`Config`** (`@madda/config` / reexport em `@madda/core`).

```ts
import { Config } from "@madda/core";
import appConfig from "../config/app.js";
import databaseConfig from "../config/database.js";

export function createApplicationConfig(): Config {
  return new Config({
    app: appConfig,
    database: databaseConfig,
  });
}
```

## Leitura na aplicação

```ts
const name = app.config?.get<string>("app.name");
const hasDb = app.config?.has("database");
```

Chaves usam notação pontuada: `app.env`, `database.connections.sqlite.database`.

## Variáveis de ambiente

O padrão é carregar `.env` no topo de `bootstrap/app.ts` **antes** de importar ficheiros que leem `process.env`. Os ficheiros em `config/` leem `process.env` com *fallbacks* semelhantes ao Laravel (`APP_KEY`, `DB_*`, `LOG_*`, …).

## Publicar stubs (`config:publish`)

O comando `pnpm madda config:publish` (pacote `@madda/console`) copia stubs de pacotes para a tua app, útil quando adicionas hashing, queue, etc.

## Tipos

Os *shapes* TypeScript vivem em `@madda/config` (`AppConfig`, `SessionConfigShape`, `QueueConfigShape`, …). Mantêm o `satisfies` nos teus ficheiros `config/*.ts` alinhado com o runtime.
