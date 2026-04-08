# Publicação (Release)

## Pré-requisitos

- Conta npm com permissão para o scope que vais publicar (ex.: pacote global `create-madda-app`).
- `NPM_TOKEN` configurado no CI (GitHub Actions → Secrets) se usares o workflow automático.
- Para o [Changesets action](https://github.com/changesets/action) criar o PR de versão com `GITHUB_TOKEN`, o repositório (ou organização) tem de **permitir** que Actions abram PRs: **Settings → Actions → General** → *Workflow permissions* → activar **Allow GitHub Actions to create and approve pull requests** (em contas de organização, o admin pode ter de o permitir a nível de org). Caso contrário aparece *GitHub Actions is not permitted to create or approve pull requests*. Alternativa: um PAT com scope `repo` num secret e passá-lo como `GITHUB_TOKEN` nesse job.

## CI/CD (GitHub Actions)

- **`.github/workflows/ci.yml`** — corre em *pull requests*, em *pushes* para branches que **não** são `main` (evita duplicar o mesmo job no merge), e via *workflow_dispatch*. Passos: `pnpm install --frozen-lockfile`, cache de `.turbo`, `lint`, `check-types`, `test`, `build` e `docs:build` (TypeDoc + VitePress).
- **`.github/workflows/release.yml`** — em *push* para `main`: primeiro executa o CI (reutiliza `ci.yml`); depois o [Changesets action](https://github.com/changesets/action) cria o PR de versão ou publica no npm, consoante haja changesets pendentes.
- **`.github/dependabot.yml`** — PRs semanais para dependências npm (raiz / lockfile) e para *actions* usadas nos workflows.
- **`.github/workflows/docs-pages.yml`** — em *push* para `main` (ficheiros sob `apps/docs/`, `typedoc.json`, `packages/**`, *lockfile*, etc.) ou *workflow_dispatch*: corre `pnpm run docs:build` e publica em [GitHub Pages](https://docs.github.com/en/pages). Em **Settings → Pages**, escolhe *Source: GitHub Actions*. O *deploy* usa o ambiente `github-pages` (aprová-lo na primeira execução, se o repositório pedir).

### Base URL no GitHub Pages

- Repositório normal (*project site*): o workflow define `VITEPRESS_BASE` como `/<nome-do-repo>/` (ex.: `/madda_v1/`), alinhado com `https://<user>.github.io/<repo>/`.
- Repositório **`username.github.io`** (*user/org site* na raiz): cria a variável de repositório **`VITEPRESS_BASE`** com o valor **`/`** (Settings → Secrets and variables → Actions → Variables). Caso contrário, os *assets* apontariam para um subcaminho incorrecto.

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
