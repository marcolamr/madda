/**
 * Join URL path segments with a single slash (Laravel-style route prefixes).
 */
export function joinPaths(...parts: string[]): string {
  const cleaned = parts
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .filter((p) => p.length > 0);
  if (cleaned.length === 0) {
    return "/";
  }
  return "/" + cleaned.join("/");
}
