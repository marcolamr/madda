/** Normaliza para pasta npm-friendly (kebab). */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Valida nome de pacote npm (scoped ou não). */
export function isValidPackageName(name: string): boolean {
  if (name.startsWith("@")) {
    const m = name.match(/^@([a-z0-9-~][a-z0-9-._~]*)\/([a-z0-9-~][a-z0-9-._~]*)$/i);
    return m !== null;
  }
  return /^[a-z0-9-~][a-z0-9-._~]*$/i.test(name);
}

export function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
