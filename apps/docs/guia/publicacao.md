# Publicação de pacotes

O monorepo usa [**Changesets**](https://github.com/changesets/changesets). Resumo:

1. `pnpm changeset` — descreve alterações e tipo de versão.
2. Commit dos ficheiros em `.changeset/`.
3. `pnpm changeset:version` — actualiza versões e changelogs.
4. `pnpm release` (ou `pnpm changeset:publish`) — compila o que for necessário e corre `changeset publish`.

Pacotes com `"private": true` **não** são enviados ao npm. Hoje o candidato natural à publicação pública é **`create-madda-app`**.

## CI

O workflow `.github/workflows/release.yml` usa `changesets/action` para:

- Abrir um PR de versão quando há changesets na `main`, ou
- Publicar quando as versões já foram aplicadas (conforme configuração do action e *secrets*).

Define **`NPM_TOKEN`** nos secrets do repositório para publicação automática.

## Documentação

Na **raiz do monorepo**, o ficheiro `RELEASING.md` descreve o fluxo completo (tokens npm, pacotes `private`, etc.).
