---
layout: home

hero:
  name: Madda
  text: Framework para aplicações web em Node.js
  tagline: Modelo mental próximo do Laravel (HTTP, config, consola, migrações, filas) com front integrado no estilo Next.js (React, dados em loaders, Vite SSR via play-web).
  actions:
    - theme: brand
      text: Começar
      link: /guia/introducao
    - theme: alt
      text: Referência API (TypeDoc)
      link: /api/

features:
  - title: HTTP com Fastify
    details: HttpKernel, middlewares globais, HttpRouter, controllers com decorators e geração OpenAPI 3.1 com AJV.
  - title: Monorepo @madda/*
    details: Core, database, auth, session, cache, queue, mail, notifications, broadcasting, tradução e mais — pacotes focados e composáveis.
  - title: play-web
    details: O mesmo servidor serve API Madda e o bundle Vite + React Router, com SSR e loaders que correm no servidor e no cliente.
  - title: Consola tipo Artisan
    details: migrate, db:seed, key:generate, cache:clear, make:migration e comandos registados em routes/console.ts.
---
