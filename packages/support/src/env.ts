/**
 * Typed environment access — same idea as Laravel `Illuminate\Support\Env`.
 * Reads from `process.env` (Node).
 */
export class Env {
  static get(key: string, defaultValue?: string): string | undefined {
    const v = process.env[key];
    if (v === undefined || v === "") {
      return defaultValue;
    }
    return v;
  }

  static string(key: string, defaultValue = ""): string {
    return Env.get(key, defaultValue) ?? defaultValue;
  }

  static boolean(key: string, defaultValue = false): boolean {
    const v = Env.get(key);
    if (v === undefined) return defaultValue;
    const lower = v.toLowerCase();
    return lower === "true" || lower === "1" || lower === "yes" || lower === "on";
  }

  static integer(key: string, defaultValue = 0): number {
    const v = Env.get(key);
    if (v === undefined) return defaultValue;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? defaultValue : n;
  }

  static float(key: string, defaultValue = 0): number {
    const v = Env.get(key);
    if (v === undefined) return defaultValue;
    const n = parseFloat(v);
    return Number.isNaN(n) ? defaultValue : n;
  }

  static array(key: string, separator = ",", defaultValue: string[] = []): string[] {
    const v = Env.get(key);
    if (v === undefined || v === "") return defaultValue;
    return v
      .split(separator)
      .map((s) => s.trim())
      .filter(Boolean);
  }
}
