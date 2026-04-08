#!/usr/bin/env node
import { runCreateMaddaApp } from "./run.js";
import type { TemplateId } from "./placeholders.js";
import { isValidPackageName, slugify, titleFromSlug } from "./slug.js";

function printHelp(): void {
  console.log(`
create-madda-app — Scaffold a Madda application

Usage:
  npx create-madda-app@latest
  pnpm create madda-app
  create-madda-app [path] [options]

Options:
  --help, -h                     Show this message
  --template <api|api-db|full>   Stack (with [path], runs non-interactive)
  --package <name>               npm package name (optional, non-interactive)
  --display-name <name>          APP_NAME (optional, non-interactive)

Notes:
  Designed for the Madda monorepo: package.json uses workspace:* for @madda/*.
  Run pnpm install from the monorepo root after scaffolding.
`);
}

function parseArgs(argv: string[]): {
  help: boolean;
  path?: string;
  template?: TemplateId;
  packageName?: string;
  displayName?: string;
} {
  const out: ReturnType<typeof parseArgs> = { help: false };
  const rest = [...argv];
  while (rest.length > 0) {
    const a = rest.shift()!;
    if (a === "--help" || a === "-h") {
      out.help = true;
      continue;
    }
    if (a === "--template" && rest[0]) {
      const t = rest.shift()!;
      if (t === "api" || t === "api-db" || t === "full") {
        out.template = t;
      }
      continue;
    }
    if (a === "--package" && rest[0]) {
      out.packageName = rest.shift()!;
      continue;
    }
    if (a === "--display-name" && rest[0]) {
      out.displayName = rest.shift()!;
      continue;
    }
    if (!a.startsWith("-")) {
      out.path = a;
      continue;
    }
  }
  return out;
}

const argv = process.argv.slice(2);
const parsed = parseArgs(argv);

if (parsed.help) {
  printHelp();
  process.exit(0);
}

const cwd = process.cwd();

async function main(): Promise<number> {
  if (parsed.path && parsed.template) {
    const slug = slugify(parsed.path.split(/[/\\]/).pop() || parsed.path);
    const pkg = parsed.packageName ?? (slug ? `@madda/${slug}` : "@madda/app");
    const display = parsed.displayName ?? titleFromSlug(slug || "app");
    if (!isValidPackageName(pkg)) {
      console.error(`Invalid --package: ${pkg}`);
      return 1;
    }
    return runCreateMaddaApp({
      cwd,
      nonInteractive: {
        targetDir: parsed.path,
        template: parsed.template,
        packageName: pkg,
        displayName: display,
        slug: slug || "app",
      },
    });
  }

  if (parsed.path || parsed.template || parsed.packageName || parsed.displayName) {
    console.error(
      "For non-interactive mode, pass both a path and --template <api|api-db|full>.\nExample: create-madda-app apps/my-app --template api-db",
    );
    return 1;
  }

  return runCreateMaddaApp({ cwd });
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
