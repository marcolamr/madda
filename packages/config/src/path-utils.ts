export function getByPath(obj: unknown, path: string): unknown {
  if (path === "") {
    return obj;
  }
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function setByPath(target: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split(".");
  const last = parts.pop();
  if (!last) {
    return;
  }
  let current: Record<string, unknown> = target;
  for (const part of parts) {
    const next = current[part];
    if (next === undefined || typeof next !== "object") {
      const nested: Record<string, unknown> = {};
      current[part] = nested;
      current = nested;
    } else {
      current = next as Record<string, unknown>;
    }
  }
  current[last] = value;
}
