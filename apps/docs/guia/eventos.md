# Eventos e command bus

## Eventos (`@madda/events`)

- **`Dispatcher`** com `listen`, `forget`, `emit` **síncrono**.
- Eventos podem ser classes que estendem `Event` ou strings.
- `discoverEventListeners` ajuda a registar *listeners* por convenção (imports opt-in).

Use para desacoplar domínio dentro do mesmo processo (não confundir com filas assíncronas).

## Command bus (`@madda/bus`)

- **`CommandBus`** regista handlers (`register`, `registerHandler` + decorator `@Handles`).
- `dispatch` síncrono; `dispatchAsync` pode passar por `@madda/pipeline`.

Integra com `@madda/reflection` para metadados de comandos.

## Quando usar o quê

| Necessidade | Ferramenta |
|-------------|------------|
| Reagir no mesmo pedido / processo | `Dispatcher` |
| Caso de uso com um handler claro | `CommandBus` |
| Trabalho pesado ou fiabilidade | `@madda/queue` + jobs |
