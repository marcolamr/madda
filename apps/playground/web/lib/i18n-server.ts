/// <reference path="../vite-env.d.ts" />

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createTranslatorFromDir, type Translator } from "@madda/translation";

const playgroundRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
const langDir = resolve(playgroundRoot, "lang");

let cache: { key: string; t: Translator } | null = null;

function resolvedLocale(): string {
  return typeof __PLAY_APP_LOCALE__ !== "undefined"
    ? __PLAY_APP_LOCALE__
    : (process.env.APP_LOCALE ?? "en");
}

function localeCacheKey(): string {
  return `${resolvedLocale()}:${process.env.APP_FALLBACK_LOCALE ?? "en"}`;
}

/** Tradutor para loaders SSR / Node (lê `lang/{locale}.json`). */
export async function getTranslator(): Promise<Translator> {
  const key = localeCacheKey();
  if (cache?.key === key) {
    return cache.t;
  }
  const t = await createTranslatorFromDir({
    directory: langDir,
    locale: resolvedLocale(),
    fallbackLocale: process.env.APP_FALLBACK_LOCALE ?? "en",
  });
  cache = { key, t };
  return t;
}
