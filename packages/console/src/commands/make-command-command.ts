import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { ApplicationContract } from "@madda/core";
import { Command } from "../command.js";

/** Convert PascalCase or a plain name to kebab-case. */
function toKebab(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

/** Ensure the class name ends with "Command". */
function toClassName(name: string): string {
  const base = name.replace(/command$/i, "");
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}Command`;
}

export class MakeCommandCommand extends Command {
  readonly signature = "make:command {name : The command class name (e.g. SendEmails)}";
  readonly description = "Create a new console command";

  constructor(private readonly app: ApplicationContract) {
    super();
  }

  async handle(): Promise<number | void> {
    const raw = this.argument("name") as string;
    const className = toClassName(raw);
    const kebab = toKebab(className.replace(/Command$/, ""));
    const relPath = `app/console/commands/${className}.ts`;
    const absPath = resolve(this.app.basePath, relPath);

    const stub = `import { Command } from "@madda/console";

export class ${className} extends Command {
  readonly signature = "${kebab}";
  readonly description = "";

  async handle(): Promise<void> {
    //
  }
}
`;

    await mkdir(dirname(absPath), { recursive: true });

    try {
      await writeFile(absPath, stub, { flag: "wx" }); // fail if exists
    } catch {
      this.error(`File already exists: ${relPath}`);
      return 1;
    }

    this.success(`Command created: ${relPath}`);
    this.line(`\nRegister it in routes/console.ts:`);
    this.line(`  import { ${className} } from "../app/console/commands/${className}.js";`);
    this.line(`  Artisan.register(new ${className}());`);
  }
}
