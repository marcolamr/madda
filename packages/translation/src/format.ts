/**
 * Resolve chave em notação de pontos (ex.: `web.title`) numa árvore de mensagens JSON.
 */
export function lookupTranslation(
  messages: unknown,
  key: string,
): string | undefined {
  const parts = key.split(".").filter(Boolean);
  let cur: unknown = messages;
  for (const p of parts) {
    if (cur === null || typeof cur !== "object") {
      return undefined;
    }
    const o = cur as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(o, p)) {
      return undefined;
    }
    cur = o[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

/**
 * Substitui placeholders estilo Laravel (`:name`, `:count`) no texto.
 */
export function formatMessage(
  template: string,
  replace?: Record<string, string | number>,
): string {
  if (!replace) {
    return template;
  }
  return template.replace(
    /:([a-zA-Z0-9_]+)/g,
    (match, name: string) =>
      Object.prototype.hasOwnProperty.call(replace, name)
        ? String(replace[name as keyof typeof replace])
        : match,
  );
}
