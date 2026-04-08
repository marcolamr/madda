# Changesets

Este monorepo usa [Changesets](https://github.com/changesets/changesets) para versionar e publicar pacotes.

## Fluxo típico

1. Depois de alterações relevantes, crie um changeset:
   ```bash
   pnpm changeset
   ```
2. Faça commit do ficheiro gerado em `.changeset/*.md`.
3. Na `main`, aplique versões e atualize changelogs:
   ```bash
   pnpm changeset:version
   ```
4. Publique no npm (pacotes não `private` com `publishConfig` correcto):
   ```bash
   pnpm changeset:publish
   ```

O pacote **`create-madda-app`** é o principal candidato à publicação pública; os pacotes `@madda/*` estão `private: true` até decidires abrir o scope no npm.

## Scripts na raiz

| Script | Descrição |
|--------|-----------|
| `pnpm changeset` | Adiciona um novo changeset (interactivo). |
| `pnpm changeset:version` | Consome changesets, bump de versões e CHANGELOGs. |
| `pnpm changeset:publish` | Compila artefactos necessários e corre `changeset publish`. |
| `pnpm release` | Alias recomendado antes de publicar (build alvo + publish). |
