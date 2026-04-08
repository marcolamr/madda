# Introdução

**Madda** é um conjunto de pacotes TypeScript para construir aplicações web e APIs em Node.js, com um **modelo mental alinhado ao Laravel**: aplicação (`Application`), kernel HTTP, ficheiros em `config/`, rotas em `routes/web.ts`, consola em `routes/console.ts`, migrações em `database/migrations/`, etc.

No **frontend**, o pacote `@madda/play-web` integra **Vite + React Router** no mesmo processo Fastify, com **SSR** e **loaders** de dados — uma experiência próxima do **Next.js** (App Router / dados no servidor) sem abandonar o ecossistema React.

## Para quem é

- Equipas que gostam da organização Laravel mas querem **TypeScript end-to-end**.
- Projetos que precisam de **API JSON** + **UI React** no mesmo servidor de desenvolvimento e produção.
- Monorepos que beneficiam de pacotes pequenos (`@madda/http`, `@madda/session`, …) em vez de um framework monolítico.

## O que não é

- Não é um clone linha-a-linha do Laravel nem do Next.js: as APIs têm nomes e fluxos próprios, inspirados nesses produtos.
- Não inclui ORM “Eloquent completo”; o pacote `@madda/database` oferece ligações SQL, migrações e um estilo de modelos em evolução.

## Próximos passos

1. [Início rápido](./inicio-rapido.md) — requisitos, clone, `pnpm`, scaffold.
2. [Pacotes do ecossistema](./pacotes.md) — mapa dos pacotes `@madda/*`.
3. [Referência API (TypeDoc)](/api/) — tipos e funções públicas geradas a partir do código-fonte.

## Convenções desta documentação

- **Caminhos** são relativos à raiz de uma aplicação gerada (ex.: `apps/minha-app`), salvo indicação em contrário.
- **Código** assume ESM (`"type": "module"`) e TypeScript.
- Quando falamos em “Laravel” ou “Next.js”, referimo-nos a **conceitos** (kernel, middleware, loaders), não a compatibilidade binária com esses frameworks.
