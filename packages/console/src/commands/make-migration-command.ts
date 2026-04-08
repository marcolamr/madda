import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { ApplicationContract } from "@madda/core";
import { Command } from "../command.js";

const SAFE_TABLE = /^[A-Za-z_][A-Za-z0-9_]*$/;

/** `snake_case` a partir de `create_foo`, `CreateFoo`, `createFooBar`, etc. */
function toSnakeCase(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase()
    .replace(/^_+|_+$/g, "")
    .replace(/__+/g, "_");
}

/** `create_posts_table` → `CreatePostsTable` */
function toMigrationClassName(snake: string): string {
  return snake
    .split("_")
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join("");
}

function migrationFileTimestamp(): string {
  const d = new Date();
  const p = (n: number, z = 2) => String(n).padStart(z, "0");
  return `${d.getFullYear()}_${p(d.getMonth() + 1)}_${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}_${p(d.getMilliseconds(), 3)}`;
}

export class MakeMigrationCommand extends Command {
  readonly signature =
    "make:migration {name : Migration name, e.g. create_posts_table or CreatePostsTable} {--table= : Optional table name for a minimal create/drop stub}";
  readonly description = "Create a new database migration file";

  constructor(private readonly app: ApplicationContract) {
    super();
  }

  async handle(): Promise<number | void> {
    const raw = this.argument("name") as string;
    if (!raw?.trim()) {
      this.error("Migration name is required.");
      return 1;
    }

    const snake = toSnakeCase(raw.trim());
    if (!snake) {
      this.error("Invalid migration name.");
      return 1;
    }

    const tableOpt = this.option("table");
    const table =
      typeof tableOpt === "string" && tableOpt.trim() !== "" ? tableOpt.trim() : undefined;
    if (table !== undefined && !SAFE_TABLE.test(table)) {
      this.error(
        "Invalid --table: use only letters, digits and underscores (matching /^[A-Za-z_][A-Za-z0-9_]*$/).",
      );
      return 1;
    }

    const className = toMigrationClassName(snake);
    const ts = migrationFileTimestamp();
    const baseFile = `${ts}_${snake}`;
    const relPath = `database/migrations/${baseFile}.ts`;
    const absPath = resolve(this.app.basePath, relPath);

    const upBody =
      table !== undefined
        ? `    await connection.run(\`
      create table if not exists "${table}" (
        "id" integer primary key autoincrement
      )
    \`);`
        : `    //`;

    const downBody =
      table !== undefined
        ? `    await connection.run(\`drop table if exists "${table}"\`);`
        : `    //`;

    const stub = `import type { ConnectionContract, Migration } from "@madda/database";

/**
 * ${className}
 */
export default class ${className} implements Migration {
  async up(connection: ConnectionContract): Promise<void> {
${upBody}
  }

  async down(connection: ConnectionContract): Promise<void> {
${downBody}
  }
}
`;

    await mkdir(dirname(absPath), { recursive: true });

    try {
      await writeFile(absPath, stub, { flag: "wx" });
    } catch {
      this.error(`File already exists or could not be written: ${relPath}`);
      return 1;
    }

    this.success(`Migration created: ${relPath}`);
    this.line(`\nRun: pnpm madda migrate`);
  }
}
