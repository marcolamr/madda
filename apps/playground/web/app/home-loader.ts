import { v1Paths } from "@madda/contracts";
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
 *
 * No SSR não fazemos `fetch` ao próprio servidor: o mesmo processo servia a página e cada
 * render (Vite/StrictMode/múltiplos pedidos HTML) multiplicava `GET /v1/ping` e sessões em disco.
 */
export async function homeLoader(): Promise<HomeLoaderData> {
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
    return {
      welcome,
      blurb,
      title,
      loaderIntro,
      ping: { pong: true },
    };
  }

  const res = await fetch(v1Paths.ping, {
    credentials: "include",
  });

  /** `typeof` evita ReferenceError se o `define` não tiver corrido nalgum chunk. */
  const locale =
    typeof __PLAY_APP_LOCALE__ !== "undefined" ? __PLAY_APP_LOCALE__ : "en";
  welcome = translateClient(locale, "web.welcome", { app: "Playground" });
  blurb = translateClient(locale, "web.blurb", {
    routes: "routes/web.ts",
    folder: "web/app/",
  });
  title = translateClient(locale, "web.title");
  loaderIntro = translateClient(locale, "web.loader_intro");

  const base = { welcome, blurb, title, loaderIntro };

  if (!res.ok) {
    return { ...base, ping: null, error: res.status };
  }
  const text = await res.text();
  if (!text.trim()) {
    return { ...base, ping: null };
  }
  try {
    return {
      ...base,
      ping: JSON.parse(text) as { pong?: boolean },
    };
  } catch {
    return { ...base, ping: null };
  }
}
