import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Madda",
  description:
    "Framework Node.js com modelo mental Laravel e experiência de front próxima de Next.js (React + Vite SSR).",
  lang: "pt-BR",
  cleanUrls: true,
  srcDir: ".",
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
