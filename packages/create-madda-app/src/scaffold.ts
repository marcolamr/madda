import { access, cp, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import type { PlaceholderValues, TemplateId } from "./placeholders.js";
import { applyPlaceholders } from "./placeholders.js";

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".json",
  ".mjs",
  ".md",
  ".html",
  ".css",
  ".example",
]);

function isProbablyTextFile(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower === ".gitignore" || lower === ".env.example") {
    return true;
  }
  const dot = lower.lastIndexOf(".");
  const ext = dot >= 0 ? lower.slice(dot) : "";
  return TEXT_EXTENSIONS.has(ext);
}

export function templatesDir(): string {
  return fileURLToPath(new URL("../templates", import.meta.url));
}

export async function scaffoldFromTemplate(options: {
  template: TemplateId;
  targetDir: string;
  values: PlaceholderValues;
}): Promise<void> {
  const srcRoot = join(templatesDir(), options.template);
  let dirExists = false;
  try {
    await access(options.targetDir, fsConstants.F_OK);
    dirExists = true;
  } catch {
    dirExists = false;
  }
  if (dirExists) {
    const existing = await readdir(options.targetDir);
    if (existing.length > 0) {
      throw new Error(`Target directory is not empty: ${options.targetDir}`);
    }
  }
  await mkdir(options.targetDir, { recursive: true });
  await copyTree(srcRoot, options.targetDir, options.values);
}

async function copyTree(src: string, dest: string, values: PlaceholderValues): Promise<void> {
  const entries = await readdir(src, { withFileTypes: true });
  for (const ent of entries) {
    const from = join(src, ent.name);
    const to = join(dest, ent.name);
    if (ent.isDirectory()) {
      await mkdir(to, { recursive: true });
      await copyTree(from, to, values);
    } else if (ent.isFile()) {
      const st = await stat(from);
      if (!st.isFile()) {
        continue;
      }
      if (isProbablyTextFile(ent.name)) {
        let text = await readFile(from, "utf8");
        text = applyPlaceholders(text, values);
        await mkdir(dirname(to), { recursive: true });
        await writeFile(to, text, "utf8");
      } else {
        await mkdir(dirname(to), { recursive: true });
        await cp(from, to);
      }
    }
  }
}

/** Caminho relativo ao monorepo root para mensagens pós-criação. */
export function relativeToMonorepo(monorepoRoot: string, targetDir: string): string {
  return relative(monorepoRoot, targetDir).split("\\").join("/");
}
