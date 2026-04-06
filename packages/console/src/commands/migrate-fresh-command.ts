import { Command } from "../command.js";
import type { MigrationRunner } from "../database/migration-runner.js";
import type { ApplicationContract } from "@madda/core";

export class MigrateFreshCommand extends Command {
  readonly signature =
    "migrate:fresh {--seed : Run seeders after migrating} {--seeder=DatabaseSeeder : Seeder class to run}";
  readonly description = "Drop all tables and re-run all migrations";

  constructor(
    private readonly runner: MigrationRunner,
    private readonly app: ApplicationContract,
  ) {
    super();
  }

  async handle(): Promise<void> {
    this.warn("Dropping all tables...");
    await this.runner.dropAllTables();

    this.info("Running migrations...");
    const ran = await this.runner.run();
    for (const file of ran) {
      this.line(`  \x1b[32mMIGRATED\x1b[0m  ${file.name}`);
    }
    this.newLine();
    this.success(`Ran ${ran.length} migration(s).`);

    if (this.hasOption("seed")) {
      const seederClass = (this.option("seeder") as string | undefined) ?? "DatabaseSeeder";
      await this.runSeeder(seederClass);
    }
  }

  private async runSeeder(className: string): Promise<void> {
    const { resolve } = await import("node:path");
    const { pathToFileURL } = await import("node:url");
    const fileName = className
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
      .toLowerCase();
    const path = resolve(this.app.basePath, `database/seeders/${fileName}.ts`);

    const mod = (await import(pathToFileURL(path).href)) as Record<string, unknown>;
    const Ctor = (mod[className] ?? mod["default"]) as (new () => { run(): Promise<void> }) | undefined;
    if (typeof Ctor !== "function") {
      this.error(`Seeder "${className}" not found in ${path}`);
      return;
    }

    this.info(`Running seeder: ${className}`);
    await new Ctor().run();
    this.success("Database seeded.");
  }
}
