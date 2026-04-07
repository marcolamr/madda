import type { TranslationConfigShape } from "@madda/core";

/**
 * Ficheiros: `lang/{locale}.json` e opcionalmente `lang/{locale}/*.json` (namespace = nome do ficheiro).
 */
const translationConfig = {
  path: "lang",
} satisfies TranslationConfigShape;

export default translationConfig;
