# Base de dados

## Configuração

`config/database.ts` define `default` e `connections` (SQLite, MySQL, Postgres), espelhando a ideia de `config/database.php` no Laravel.

Variáveis típicas:

- `DB_CONNECTION` — `sqlite` por defeito em muitos exemplos.
- `DB_DATABASE` — caminho do ficheiro SQLite relativo ao `basePath` da app.

## DatabaseManager

No bootstrap, após criar a `Application`, chama-se normalmente `bootstrapDatabase(app)` que:

1. Lê `database` da config.
2. Instancia `DatabaseManager` com `basePath` para resolver caminhos relativos.
3. Executa `bootModels()` se usares modelos Madda.

O gestor expõe `connection()` para obter o **`ConnectionContract`** activo.

## Migrações

Ficheiros em `database/migrations/*.ts` exportam uma classe por defeito com `up(connection)` e `down(connection)` (SQL driver-agnóstico).

Comandos (`@madda/console`):

| Comando | Efeito |
|---------|--------|
| `madda migrate` | Aplica pendentes. |
| `madda migrate:status` | Lista estado. |
| `madda migrate:rollback` | Reverte o último *batch*. |
| `madda migrate:fresh` | Reinicia esquema (cuidado; suporte `--drop` varia por driver). |
| `madda make:migration` | Gera novo ficheiro com timestamp. |

A tabela de controlo é `_migrations` (prefixo underscore).

## Boas práticas

- Usa **parâmetros ligados** (`?` / placeholders) em todas as queries — evita injecção SQL.
- Mantém migrações **idempotentes** onde fizer sentido (`IF NOT EXISTS`, etc., conforme o motor).
