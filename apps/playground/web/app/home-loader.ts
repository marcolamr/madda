import { translateClient } from "../lib/i18n-client";

export type HomeLoaderData = {
  ping: { pong?: boolean } | null;
  error?: number;
  welcome: string;
  blurb: string;
  title: string;
  loaderIntro: string;
};

/**
 * Corre no SSR e no browser (navegação cliente). Só no SSR usa `node:fs` via `getTranslator`;
 * no client usa `translateClient` + `__PLAY_APP_LOCALE__` (define do Vite).
 */
function pingRequestUrl(): string {
  if (import.meta.env.SSR) {
    return `${__PLAY_WEB_INTERNAL_ORIGIN__}/v1/ping`;
  }
  /** Mesma origem que o documento (evita falhar com localhost vs 127.0.0.1). */
  return "/v1/ping";
}

export async function homeLoader(): Promise<HomeLoaderData> {
  const res = await fetch(pingRequestUrl());

  let welcome: string;
  let blurb: string;
  let title: string;
  let loaderIntro: string;

  if (import.meta.env.SSR) {
    const { getTranslator } = await import("../lib/i18n-server.js");
    const translator = await getTranslator();
    welcome = translator.trans("web.welcome", { app: "Playground" });
    blurb = translator.trans("web.blurb", {
      routes: "routes/web.ts",
      folder: "web/app/",
    });
    title = translator.trans("web.title");
    loaderIntro = translator.trans("web.loader_intro");
  } else {
    /** `typeof` evita ReferenceError se o `define` não tiver corrido nalgum chunk. */
    const locale =
      typeof __PLAY_APP_LOCALE__ !== "undefined"
        ? __PLAY_APP_LOCALE__
        : "en";
    welcome = translateClient(locale, "web.welcome", { app: "Playground" });
    blurb = translateClient(locale, "web.blurb", {
      routes: "routes/web.ts",
      folder: "web/app/",
    });
    title = translateClient(locale, "web.title");
    loaderIntro = translateClient(locale, "web.loader_intro");
  }

  const base = { welcome, blurb, title, loaderIntro };

  if (!res.ok) {
    return { ...base, ping: null, error: res.status };
  }
  return {
    ...base,
    ping: (await res.json()) as { pong?: boolean },
  };
}
