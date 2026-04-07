/// <reference path="../vite-env.d.ts" />

export type RootLoaderData = {
  locale: string;
};

/**
 * Tem de coincidir com o que o Vite injeta (`vite.config` → `__PLAY_APP_LOCALE__`).
 * Usar só `process.env.APP_LOCALE` no browser deixa `undefined` → mismatch com o SSR
 * e hidratação rebenta; o Vite em dev faz full reload e parece loop infinito.
 */
export async function rootLoader(): Promise<RootLoaderData> {
  const locale =
    typeof __PLAY_APP_LOCALE__ !== "undefined"
      ? __PLAY_APP_LOCALE__
      : (process.env.APP_LOCALE ?? "en");
  return { locale };
}
