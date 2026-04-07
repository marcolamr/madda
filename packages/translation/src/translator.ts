import { formatMessage, lookupTranslation } from "./format.js";
import { loadLocaleMessages } from "./load-messages.js";

export class Translator {
  constructor(
    private readonly primary: Record<string, unknown>,
    private readonly fallback: Record<string, unknown>,
    /** Locale activo (ex.: `config('app.locale')`). */
    readonly locale: string,
  ) {}

  /**
   * Traduz chave em notação de pontos; fallback de locale e por fim a própria chave.
   */
  trans(key: string, replace?: Record<string, string | number>): string {
    const raw =
      lookupTranslation(this.primary, key) ??
      lookupTranslation(this.fallback, key);
    if (raw === undefined) {
      return key;
    }
    return formatMessage(raw, replace);
  }

  /** Árvore crua (ex.: hidratar o client com o mesmo namespace). */
  getPrimaryMessages(): Readonly<Record<string, unknown>> {
    return this.primary;
  }

  getFallbackMessages(): Readonly<Record<string, unknown>> {
    return this.fallback;
  }
}

export type CreateTranslatorFromDirOptions = {
  directory: string;
  locale: string;
  fallbackLocale: string;
};

export async function createTranslatorFromDir(
  options: CreateTranslatorFromDirOptions,
): Promise<Translator> {
  const primary = await loadLocaleMessages(options.directory, options.locale);
  const fallback = await loadLocaleMessages(
    options.directory,
    options.fallbackLocale,
  );
  return new Translator(primary, fallback, options.locale);
}
