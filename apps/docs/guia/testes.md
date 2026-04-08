# Testes

## Vitest

Os pacotes usam **Vitest** onde há testes (`pnpm test` via Turbo). Configuração por pacote.

## HTTP

`@madda/http` expõe **`injectHttp`** (subpath `testing`) para construir pedidos contra o pipeline sem abrir porto — útil para testes de integração de rotas.

## Mail

`FakeMailTransport` (`@madda/mail`) permite asserções sobre mensagens enviadas.

## Filas

`FakeQueueDriver` (`@madda/queue/testing`) substitui o driver real em testes.

## Eventos

`RecordingDispatcher` (`@madda/events`) regista eventos emitidos para asserções.

## Cache

`@madda/testing` inclui helpers para cache em memória e utilitários async (`flushMicrotasks`, `waitFor`).

## Boas práticas

- Testa **contratos públicos** (exports dos pacotes) mais do que detalhes internos.
- Para apps, combina testes de **rotas** com *fixtures* de base de dados SQLite em ficheiro temporário.
