import { readFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";

async function readJsonFile(file: string): Promise<Record<string, unknown>> {
  try {
    const raw = await readFile(file, "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return {};
    }
    return data as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Lê `directory/{locale}.json` e, se existir `directory/{locale}/*.json`, faz merge
 * com o nome do ficheiro (sem extensão) como chave de topo (estilo Laravel `lang/en/auth.php` → `auth.*`).
 */
export async function loadLocaleMessages(
  directory: string,
  locale: string,
): Promise<Record<string, unknown>> {
  const mainPath = path.join(directory, `${locale}.json`);
  let merged = await readJsonFile(mainPath);

  const subdir = path.join(directory, locale);
  let entries: string[] = [];
  try {
    entries = await readdir(subdir, { withFileTypes: true }).then((list) =>
      list.filter((d) => d.isFile() && d.name.endsWith(".json")).map((d) => d.name),
    );
  } catch {
    return merged;
  }

  for (const name of entries) {
    const stem = name.replace(/\.json$/i, "");
    const piece = await readJsonFile(path.join(subdir, name));
    merged = { ...merged, [stem]: deepMerge(merged[stem], piece) };
  }

  return merged;
}

function deepMerge(
  a: unknown,
  b: Record<string, unknown>,
): Record<string, unknown> {
  if (a === null || typeof a !== "object" || Array.isArray(a)) {
    return { ...b };
  }
  const out = { ...(a as Record<string, unknown>) };
  for (const [k, v] of Object.entries(b)) {
    const existing = out[k];
    if (
      existing !== null &&
      typeof existing === "object" &&
      !Array.isArray(existing) &&
      v !== null &&
      typeof v === "object" &&
      !Array.isArray(v)
    ) {
      out[k] = deepMerge(existing, v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}
