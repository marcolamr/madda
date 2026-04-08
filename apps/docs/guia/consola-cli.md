# Consola (CLI)

A consola Madda espelha a ideia do **Artisan**: comandos registados globalmente e invocados via `pnpm madda` (ou `tsx src/madda.ts`).

## Rotas de consola

Em `routes/console.ts`:

```ts
import { Madda } from "@madda/console";

Madda.command("saudar {nome}", function () {
  this.line(`Olá, ${this.argument("nome")}!`);
}).describe("Saudação simples");
```

Também podes registar classes `extends Command` com `Madda.register(new MeuComando())`.

## Comandos built-in (resumo)

| Comando | Descrição |
|---------|-----------|
| `list` / `help` | Descoberta e ajuda. |
| `key:generate` | Gera `APP_KEY` estilo Laravel no `.env`. |
| `config:publish` | Publica stubs de configuração. |
| `make:command` | Gera ficheiro de comando. |
| `make:migration` | Gera migração em `database/migrations/`. |
| `migrate*` , `db:seed` | Disponíveis se existir chave `database` na config. |
| `cache:clear` | Limpa cache (`@madda/cache`) se existir `app.config`. |

## Chamada programática

```ts
await kernel.call("db:seed", ["--class=UserSeeder"]);
```

Útil em scripts de CI ou tarefas de manutenção.

## Assinaturas

As *signatures* seguem o estilo Laravel: `{argumento}`, `{--opção}`, `{--flag}`. O parser vive em `@madda/console` (`parseSignature`, classe `Input`).
