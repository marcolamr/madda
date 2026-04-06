/** Resolve dot paths on plain objects (Laravel `data_get` subset). */
export function dataGet(obj: unknown, path: string): unknown {
  if (path === "") return obj;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") {
      return undefined;
    }
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}
