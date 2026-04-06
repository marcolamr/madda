import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { ApplicationContract } from "@madda/core";
import { Command } from "../command.js";

/** Convert PascalCase class name to kebab-case filename. */
function toFileName(className: string): string {
  return className
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export class DbSeedCommand extends Command {
  readonly signature =
    "db:seed {--class=DatabaseSeeder : The seeder class to run}";
  readonly description = "Seed the database with records";

  constructor(private readonly app: ApplicationContract) {
    super();
  }

  async handle(): Promise<number | void> {
    const className = (this.option("class") as string | undefined) ?? "DatabaseSeeder";
    const fileName = toFileName(className);
    const path = resolve(this.app.basePath, `database/seeders/${fileName}.ts`);

    let mod: Record<string, unknown>;
    try {
      mod = (await import(pathToFileURL(path).href)) as Record<string, unknown>;
    } catch {
      this.error(`Seeder file not found: database/seeders/${fileName}.ts`);
      return 1;
    }

    const Ctor = (mod[className] ?? mod["default"]) as
      | (new () => { run(): Promise<void> })
      | undefined;

    if (typeof Ctor !== "function") {
      this.error(`Class "${className}" not found in database/seeders/${fileName}.ts`);
      return 1;
    }

    this.info(`Seeding: ${className}`);
    await new Ctor().run();
    this.success("Database seeded.");
  }
}
