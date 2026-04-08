import type { Plugin } from "vite";
import { defineConfig } from "vitepress";

/** Base Vite (`/` em local; em GitHub Pages de projeto costuma ser `/<nome-do-repo>/`). */
function vitepressBase(): string {
  const raw = process.env.VITEPRESS_BASE?.trim();
  if (!raw || raw === "/") {
    return "/";
  }
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.endsWith("/") ? withSlash : `${withSlash}/`;
}

/** Prefixo sem trailing slash; string vazia quando `base` é `/`. */
function basePathPrefix(base: string): string {
  if (base === "/") {
    return "";
  }
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

/**
 * Em dev, o Vite não resolve `public/api/` → `public/api/index.html` como o preview/build.
 * Com `base` não raiz, o pedido chega como `/<base>/api/`.
 */
function typedocApiIndexDevPlugin(base: string): Plugin {
  const prefix = basePathPrefix(base);
  const candidates = new Set<string>(
    prefix === "" ? ["/api", "/api/"] : [`${prefix}/api`, `${prefix}/api/`],
  );

  return {
    name: "typedoc-api-index-dev",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? "";
        const pathname = url.split("?")[0] ?? "";
        if (candidates.has(pathname)) {
          const query = url.includes("?") ? url.slice(url.indexOf("?")) : "";
          const target = prefix === "" ? "/api/index.html" : `${prefix}/api/index.html`;
          req.url = target + query;
        }
        next();
      });
    },
  };
}

const base = vitepressBase();
const baseNoSlash = basePathPrefix(base);
const apiStaticLink =
  baseNoSlash === ""
    ? /^\/api(?:\/|$)/
    : new RegExp(
        `^${baseNoSlash.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/api(?:\/|$)`,
      );

export default defineConfig({
  title: "Madda",
  description:
    "Framework Node.js com modelo mental Laravel e experiência de front próxima de Next.js (React + Vite SSR).",
  lang: "pt-BR",
  base,
  cleanUrls: true,
  /** TypeDoc escreve `public/api/index.html`; o checker só vê rotas MD, não `public/`. */
  ignoreDeadLinks: [apiStaticLink],
  srcDir: ".",
  vite: {
    plugins: [typedocApiIndexDevPlugin(base)],
  },
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Guia", link: "/guia/introducao" },
      { text: "Referência API", link: "/api/" },
      { text: "Publicação", link: "/guia/publicacao" },
    ],
    sidebar: [
      {
        text: "Começar",
        items: [
          { text: "Introdução", link: "/guia/introducao" },
          { text: "Início rápido", link: "/guia/inicio-rapido" },
          { text: "Pacotes do ecossistema", link: "/guia/pacotes" },
        ],
      },
      {
        text: "Aplicação & HTTP",
        items: [
          { text: "Núcleo da aplicação", link: "/guia/nucleo-aplicacao" },
          { text: "HTTP, rotas e middlewares", link: "/guia/http-e-rotas" },
          { text: "Configuração", link: "/guia/configuracao" },
        ],
      },
      {
        text: "Dados & CLI",
        items: [
          { text: "Base de dados", link: "/guia/base-de-dados" },
          { text: "Consola (CLI)", link: "/guia/consola-cli" },
        ],
      },
      {
        text: "Segurança & sessão",
        items: [{ text: "Autenticação e sessão", link: "/guia/autenticacao-sessao" }],
      },
      {
        text: "Infraestrutura",
        items: [
          { text: "Cache, Redis, filas", link: "/guia/infraestrutura-cache-filas" },
          { text: "E-mail e notificações", link: "/guia/email-notificacoes" },
          { text: "Broadcasting em tempo real", link: "/guia/broadcasting" },
        ],
      },
      {
        text: "Avançado",
        items: [
          { text: "Eventos e command bus", link: "/guia/eventos" },
          { text: "play-web (React + Vite SSR)", link: "/guia/play-web" },
          { text: "Testes", link: "/guia/testes" },
          { text: "Referência API (TypeDoc)", link: "/api/" },
        ],
      },
    ],
    search: {
      provider: "local",
    },
    footer: {
      message: "Documentação Madda",
      copyright: "Licença conforme cada pacote",
    },
    outline: { label: "Nesta página" },
    docFooter: {
      prev: "Anterior",
      next: "Seguinte",
    },
    returnToTopLabel: "Voltar ao topo",
    sidebarMenuLabel: "Menu",
    darkModeSwitchLabel: "Tema",
    lightModeSwitchTitle: "Modo claro",
    darkModeSwitchTitle: "Modo escuro",
  },
});
