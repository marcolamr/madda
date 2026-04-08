# Cache, Redis e filas

## Redis

`@madda/redis` fornece `redisConnectionFromConfig` e um contrato comum usado por cache, filas e sessão quando escolhes driver Redis.

Config típica em `config/` (chaves `redis.default`, `redis.connections.*`).

## Cache

`createCacheManagerFromConfig` constrói um **`CacheManager`** com lojas:

- **file** — directório em disco (padrão próximo do Laravel).
- **array** — só em memória (testes).
- **redis** — partilhado com a ligação configurada.

Comando **`cache:clear`** (`@madda/console`): limpa a loja por defeito, `--store=nome` ou `--all`.

## Filas

`@madda/queue` inclui:

- **sync** — executa o job no mesmo processo.
- **redis** — listas `rpush` / `blpop`.
- **database** — tabela `jobs` (SQLite nos exemplos).

`createQueueManagerFromConfig` alinha com `QueueConfigShape`. `listenQueued` liga eventos a jobs assíncronos.

### Boas práticas

- Mantém payloads de jobs **pequenos e serializáveis** (JSON).
- Usa **timeouts** e **retries** ao desenhar *workers* (o teu loop `workOnce` deve tratar erros e *backoff*).
