/** Array / list helpers — subset of Laravel `Illuminate\Support\Arr`. */
export class Arr {
  static wrap<T>(value: T | T[]): T[] {
    if (value == null) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  }

  static get(obj: unknown, key: string | number, defaultValue?: unknown): unknown {
    if (key === "" || key == null) {
      return obj;
    }
    if (Array.isArray(obj) && typeof key === "number") {
      return obj[key] ?? defaultValue;
    }
    if (typeof key === "number") {
      return defaultValue;
    }
    const parts = String(key).split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur == null || typeof cur !== "object") {
        return defaultValue;
      }
      cur = (cur as Record<string, unknown>)[p];
    }
    return cur ?? defaultValue;
  }

  static has(obj: unknown, key: string): boolean {
    const parts = key.split(".");
    let cur: unknown = obj;
    for (const p of parts) {
      if (cur == null || typeof cur !== "object") {
        return false;
      }
      if (!Object.prototype.hasOwnProperty.call(cur, p)) {
        return false;
      }
      cur = (cur as Record<string, unknown>)[p];
    }
    return true;
  }

  static set(obj: Record<string, unknown>, key: string, value: unknown): Record<string, unknown> {
    const parts = key.split(".");
    let cur: Record<string, unknown> = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      const p = parts[i]!;
      const next = cur[p];
      if (next == null || typeof next !== "object") {
        cur[p] = {};
      }
      cur = cur[p] as Record<string, unknown>;
    }
    cur[parts[parts.length - 1]!] = value;
    return obj;
  }

  static forget(obj: Record<string, unknown>, key: string): void {
    const parts = key.split(".");
    if (parts.length === 1) {
      delete obj[parts[0]!];
      return;
    }
    const parent = Arr.get(obj, parts.slice(0, -1).join(".")) as Record<string, unknown> | undefined;
    if (parent && typeof parent === "object") {
      delete parent[parts[parts.length - 1]!];
    }
  }

  static first<T>(array: readonly T[], defaultValue?: T): T | undefined {
    if (array.length === 0) {
      return defaultValue;
    }
    return array[0];
  }

  static last<T>(array: readonly T[], defaultValue?: T): T | undefined {
    if (array.length === 0) {
      return defaultValue;
    }
    return array[array.length - 1];
  }

  static only<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
    const out: Partial<T> = {};
    for (const k of keys) {
      if (Object.prototype.hasOwnProperty.call(obj, k)) {
        out[k as keyof T] = obj[k as keyof T];
      }
    }
    return out;
  }

  static except<T extends Record<string, unknown>>(obj: T, keys: string[]): Partial<T> {
    const skip = new Set(keys);
    const out: Partial<T> = {};
    for (const k of Object.keys(obj)) {
      if (!skip.has(k)) {
        out[k as keyof T] = obj[k as keyof T];
      }
    }
    return out;
  }

  static pluck<T>(array: readonly T[], key: keyof T): unknown[] {
    return array.map((item) => (item as Record<string, unknown>)[key as string]);
  }

  static flatten(array: unknown[], depth = Infinity): unknown[] {
    const out: unknown[] = [];
    const walk = (a: unknown[], d: number) => {
      for (const x of a) {
        if (Array.isArray(x) && d > 0) {
          walk(x, d - 1);
        } else {
          out.push(x);
        }
      }
    };
    walk(array, depth);
    return out;
  }

  static collapse<T>(array: readonly (readonly T[])[]): T[] {
    return ([] as T[]).concat(...array);
  }

  static isAssoc(array: unknown): array is Record<string, unknown> {
    if (array == null || typeof array !== "object" || Array.isArray(array)) {
      return false;
    }
    const keys = Object.keys(array);
    return keys.length > 0 && keys.some((k) => !/^\d+$/.test(k));
  }

  static random<T>(array: readonly T[], defaultValue?: T): T | undefined {
    if (array.length === 0) {
      return defaultValue;
    }
    const i = Math.floor(Math.random() * array.length);
    return array[i];
  }

  static shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return copy;
  }

  static prepend<T>(array: T[], value: T): T[] {
    return [value, ...array];
  }

  static add<T>(array: T[], value: T): T[] {
    return array.includes(value) ? array : [...array, value];
  }

  static pull<T>(array: T[], key: string | number): T | undefined {
    if (typeof key === "number" && Array.isArray(array)) {
      const [removed] = array.splice(key, 1);
      return removed;
    }
    return undefined;
  }

  static where<T extends Record<string, unknown>>(
    array: readonly T[],
    key: keyof T,
    operator: "=" | "==" | "===",
    value: unknown,
  ): T[] {
    return array.filter((item) => {
      const v = item[key];
      if (operator === "===") return v === value;
      return v == value;
    });
  }

  static dot(obj: Record<string, unknown>, prepend = ""): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const nk = prepend ? `${prepend}.${k}` : k;
      if (v != null && typeof v === "object" && !Array.isArray(v)) {
        Object.assign(out, Arr.dot(v as Record<string, unknown>, nk));
      } else {
        out[nk] = v;
      }
    }
    return out;
  }
}
