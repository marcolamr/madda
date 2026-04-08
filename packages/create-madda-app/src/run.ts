import * as p from "@clack/prompts";
import pc from "picocolors";
import { join, resolve } from "node:path";
import { findMaddaMonorepoRoot } from "./monorepo.js";
import { isValidPackageName, slugify, titleFromSlug } from "./slug.js";
import { relativeToMonorepo, scaffoldFromTemplate } from "./scaffold.js";
import type { PlaceholderValues, TemplateId } from "./placeholders.js";

export type RunOptions = {
  cwd: string;
  /** Skip prompts when all fields set (for tests / CI). */
  nonInteractive?: {
    targetDir: string;
    template: TemplateId;
    packageName: string;
    displayName: string;
    slug: string;
  };
};

export async function runCreateMaddaApp(options: RunOptions): Promise<number> {
  const cwd = options.cwd;
  const monoRoot = findMaddaMonorepoRoot(cwd);

  let targetDir: string;
  let template: TemplateId;
  let packageName: string;
  let displayName: string;
  let slug: string;

  if (options.nonInteractive) {
    targetDir = resolve(cwd, options.nonInteractive.targetDir);
    template = options.nonInteractive.template;
    packageName = options.nonInteractive.packageName;
    displayName = options.nonInteractive.displayName;
    slug = options.nonInteractive.slug;
    if (!monoRoot) {
      p.log.warn(
        pc.yellow(
          "No Madda monorepo detected (pnpm-workspace.yaml with apps/* and packages/*). " +
            "Generated package.json uses workspace:* — install will only work inside this repo.",
        ),
      );
    }
  } else {
    p.intro(pc.inverse(" create-madda-app ") + "  " + pc.dim("Madda · Laravel-style + optional React SSR"));

    if (!monoRoot) {
      const go = await p.confirm({
        message:
          "This folder does not look like the Madda monorepo root. Continue? " +
          "(package.json will use workspace:* — you need the monorepo for pnpm install to resolve @madda/*.)",
        initialValue: false,
      });
      if (p.isCancel(go) || !go) {
        p.cancel("Aborted.");
        return 1;
      }
    }

    const nameInput = await p.text({
      message: "Project folder name (kebab-case, e.g. my-service)",
      placeholder: "my-madda-app",
      validate: (v) => {
        const s = slugify(v || "");
        if (s.length === 0) {
          return "Use letters, numbers or hyphens.";
        }
        return undefined;
      },
    });
    if (p.isCancel(nameInput)) {
      p.cancel("Aborted.");
      return 1;
    }
    slug = slugify(nameInput as string);

    const defaultPkg = monoRoot ? `@madda/${slug}` : slug;
    const pkgInput = await p.text({
      message: "npm package name",
      initialValue: defaultPkg,
      validate: (v) => (isValidPackageName(v.trim()) ? undefined : "Invalid package name."),
    });
    if (p.isCancel(pkgInput)) {
      p.cancel("Aborted.");
      return 1;
    }
    packageName = (pkgInput as string).trim();

    const titleDefault = titleFromSlug(slug);
    const titleInput = await p.text({
      message: "App display name (APP_NAME)",
      initialValue: titleDefault,
    });
    if (p.isCancel(titleInput)) {
      p.cancel("Aborted.");
      return 1;
    }
    displayName = (titleInput as string).trim() || titleDefault;

    const stack = await p.select({
      message: "Stack",
      options: [
        {
          value: "api" as const,
          label: "API only",
          hint: "HTTP + console, no database, no frontend",
        },
        {
          value: "api-db" as const,
          label: "API + SQLite",
          hint: "Ready for pnpm madda migrate",
        },
        {
          value: "full" as const,
          label: "Full stack",
          hint: "API + SQLite + React (play-web / Vite SSR)",
        },
      ],
    });
    if (p.isCancel(stack)) {
      p.cancel("Aborted.");
      return 1;
    }
    template = stack as TemplateId;

    const defaultPath = monoRoot ? join("apps", slug) : slug;
    const pathInput = await p.text({
      message: "Where should the app be created? (relative to current directory)",
      initialValue: defaultPath,
    });
    if (p.isCancel(pathInput)) {
      p.cancel("Aborted.");
      return 1;
    }
    targetDir = resolve(cwd, (pathInput as string).trim() || defaultPath);
  }

  const values: PlaceholderValues = {
    PACKAGE_NAME: packageName,
    APP_DISPLAY_NAME: displayName,
    APP_SLUG: slug,
  };

  try {
    await scaffoldFromTemplate({ template, targetDir, values });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (!options.nonInteractive) {
      p.log.error(pc.red(msg));
    } else {
      console.error(msg);
    }
    return 1;
  }

  if (!options.nonInteractive) {
    p.outro(pc.green("Project scaffolded successfully."));
  }

  const rel = monoRoot ? relativeToMonorepo(monoRoot, targetDir) : targetDir;
  const lines = [
    "",
    pc.bold("Next steps:"),
    `  ${pc.cyan("cd")} ${rel}`,
    `  ${pc.cyan("pnpm install")}     ${pc.dim("# from monorepo root if not yet done")}`,
    `  ${pc.cyan("pnpm madda key:generate")}  ${pc.dim("# in app directory")}`,
  ];
  if (template === "api-db" || template === "full") {
    lines.push(`  ${pc.cyan("pnpm madda migrate")}`);
  }
  lines.push(`  ${pc.cyan("pnpm dev")}`);
  lines.push("");

  console.log(lines.join("\n"));
  return 0;
}
