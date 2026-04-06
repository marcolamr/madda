/**
 * Substitui `{{ chave }}` no texto (apenas `[a-zA-Z0-9_.-]+`).
 * Chaves em falta tornam-se string vazia.
 */
export function fillTemplate(template: string, vars: Record<string, string | number | boolean>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : "",
  );
}
