import { formatMessage, lookupTranslation } from "@madda/translation/runtime";
import en from "../../lang/en.json";
import pt from "../../lang/pt.json";

const bundles: Record<string, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  pt: pt as Record<string, unknown>,
};

export function getMessageTree(locale: string): Record<string, unknown> {
  return bundles[locale] ?? bundles.en ?? {};
}

/**
 * Mesmo namespace que `Translator.trans` no servidor (`lang/*.json` + chaves com pontos).
 */
export function translateClient(
  locale: string,
  key: string,
  replace?: Record<string, string | number>,
): string {
  const tree = getMessageTree(locale);
  const fallbackTree = bundles.en ?? {};
  const raw =
    lookupTranslation(tree, key) ?? lookupTranslation(fallbackTree, key);
  if (raw === undefined) {
    return key;
  }
  return formatMessage(raw, replace);
}
