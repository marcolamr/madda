# Publicação (Release)

## Pré-requisitos

- Conta npm com permissão para o scope que vais publicar (ex.: pacote global `create-madda-app`).
- `NPM_TOKEN` configurado no CI (GitHub Actions → Secrets) se usares o workflow automático.

## Com Changesets (recomendado)

1. `pnpm changeset` — descreve a alteração e escolhe o tipo de bump (major / minor / patch).
2. Commit do ficheiro em `.changeset/`.
3. `pnpm changeset:version` — actualiza `package.json` e gera entradas de CHANGELOG onde aplicável.
4. `pnpm release` (ou `pnpm changeset:publish`) — faz build do CLI e executa `changeset publish`.

Pacotes com `"private": true` são ignorados pelo `publish`. Apenas pacotes publicáveis (hoje: `create-madda-app`) são enviados ao npm.

## Publicar `@madda/*` no futuro

1. Remover ou definir `"private": false` nos pacotes desejados.
2. Garantir `name` com scope `@madda/...` e `publishConfig.access` (`public` ou `restricted`).
3. Ajustar `.changeset/config.json` (`access`, `ignore`) conforme a política do scope.
