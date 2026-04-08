# Publicação (Release)

## Pré-requisitos

- Conta npm com permissão para o scope que vais publicar (ex.: pacote global `create-madda-app`).
- `NPM_TOKEN` configurado no CI (GitHub Actions → Secrets) se usares o workflow automático — com permissão de **publish** (token clássico com *Automation* ou *Granular* com *Read and write* no scope certo). O `release.yml` define também **`NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`** ao nível do job: o `actions/setup-node` com `registry-url` só escreve o token no `.npmrc` com essa variável; sem isso, `npm publish` / `pnpm publish` podem correr **sem auth** e o registry devolve **E404** em pacotes novos.
- Scope **`@madda`**: criar a [organização no npm](https://www.npmjs.com/org/create) com o nome `madda` (o scope passa a ser `@madda`) e garantir que a conta do token é **owner** ou tem equipa com permissão de publicação. Pacotes scoped públicos usam `publishConfig.access: "public"` e, no Changesets, `"access": "public"` em `.changeset/config.json` — **`restricted`** sem org/privados pagos costuma resultar em **E404** no primeiro `npm publish`.
- Para o [Changesets action](https://github.com/changesets/action) criar o PR de versão com `GITHUB_TOKEN`, o repositório (ou organização) tem de **permitir** que Actions abram PRs: **Settings → Actions → General** → *Workflow permissions* → activar **Allow GitHub Actions to create and approve pull requests** (em contas de organização, o admin pode ter de o permitir a nível de org). Caso contrário aparece *GitHub Actions is not permitted to create or approve pull requests*. Alternativa: um PAT com scope `repo` num secret e passá-lo como `GITHUB_TOKEN` nesse job.

## CI/CD (GitHub Actions)

- **`.github/workflows/ci.yml`** — corre em *pull requests*, em *pushes* para branches que **não** são `main` (evita duplicar o mesmo job no merge), e via *workflow_dispatch*. Passos: `pnpm install --frozen-lockfile`, cache de `.turbo`, `lint`, `check-types`, `test`, `build` e `docs:build` (TypeDoc + VitePress).
- **`.github/workflows/release.yml`** — em *push* para `main`: primeiro executa o CI (reutiliza `ci.yml`); depois o [Changesets action](https://github.com/changesets/action) faz **uma de duas coisas** (não ambas no mesmo push):
  1. **Há ficheiros em `.changeset/` (exceto `README`)** — abre um PR *chore: version packages* com os bumps e CHANGELOGs. **Tens de fazer merge desse PR** para a `main`. Nessa execução **ainda não** corre `npm publish`.
  2. **Já não há changesets pendentes na `main`** (o PR anterior foi mergeado) — corre `changeset publish` e envia para o npm (com `NPM_TOKEN`). Verifica nos *logs* do job se o passo de *publish* correu ou se foi só criação de PR.
- **`.github/dependabot.yml`** — PRs semanais para dependências npm (raiz / lockfile) e para *actions* usadas nos workflows.
- **`.github/workflows/docs-pages.yml`** — em *push* para `main` (ficheiros sob `apps/docs/`, `typedoc.json`, `packages/**`, *lockfile*, etc.) ou *workflow_dispatch*: corre `pnpm run docs:build` e publica em [GitHub Pages](https://docs.github.com/en/pages). Em **Settings → Pages**, escolhe *Source: GitHub Actions*. O *deploy* usa o ambiente `github-pages` (aprová-lo na primeira execução, se o repositório pedir).

### Rate limit do npm (429) em monorepos grandes

Publicar dezenas de pacotes na mesma execução pode devolver **429 Too Many Requests**. O script `scripts/changeset-publish-retry.mjs` (usado por `pnpm run changeset:publish`) volta a correr só `changeset publish` após uma pausa (por defeito **120s**, até **10** tentativas); pacotes já publicados são ignorados.

- Variáveis opcionais: `CHANGESET_PUBLISH_RETRY_MS` (ms entre tentativas), `CHANGESET_PUBLISH_MAX_ATTEMPTS`.
- **Agora**, sem novo release: com build feito e `NODE_AUTH_TOKEN` / `NPM_TOKEN` definidos, corre na raiz `pnpm exec changeset publish` (ou `pnpm run changeset:publish` se quiseres build + retry) — só os pacotes ainda em falta (ex. `@madda/pipeline@0.0.3`) serão enviados.

### Base URL no GitHub Pages

- Repositório normal (*project site*): o workflow define `VITEPRESS_BASE` como `/<nome-do-repo>/` (ex.: `/madda_v1/`), alinhado com `https://<user>.github.io/<repo>/`.
- Repositório **`username.github.io`** (*user/org site* na raiz): cria a variável de repositório **`VITEPRESS_BASE`** com o valor **`/`** (Settings → Secrets and variables → Actions → Variables). Caso contrário, os *assets* apontariam para um subcaminho incorrecto.

## Com Changesets (recomendado)

1. `pnpm changeset` — descreve a alteração e escolhe o tipo de bump (major / minor / patch).
2. Commit do ficheiro em `.changeset/`.
3. `pnpm changeset:version` — actualiza `package.json` e gera entradas de CHANGELOG onde aplicável.
4. `pnpm release` (ou `pnpm changeset:publish`) — faz `turbo run build` em todo o monorepo e executa `changeset publish` (com `NPM_TOKEN` no ambiente, se for para o npm).

Pacotes com `"private": true` são ignorados pelo `publish`. Os restantes precisam de `publishConfig` / scope configurado no npm e de token com permissão de *publish* para esse scope (`access` em `.changeset/config.json` alinha com pacotes *restricted* vs *public*).

## Publicar `@madda/*` no futuro

1. Remover ou definir `"private": false` nos pacotes desejados.
2. Garantir `name` com scope `@madda/...` e `publishConfig.access` (`public` ou `restricted`).
3. Ajustar `.changeset/config.json` (`access`, `ignore`) conforme a política do scope.
