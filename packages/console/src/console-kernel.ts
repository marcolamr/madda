import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { ApplicationContract } from "@madda/core";
import { Artisan } from "./artisan.js";
import { DbSeedCommand } from "./commands/db-seed-command.js";
import { HelpCommand } from "./commands/help-command.js";
import { ListCommand } from "./commands/list-command.js";
import { MakeCommandCommand } from "./commands/make-command-command.js";
import { MigrateCommand } from "./commands/migrate-command.js";
import { MigrateFreshCommand } from "./commands/migrate-fresh-command.js";
import { MigrateRollbackCommand } from "./commands/migrate-rollback-command.js";
import { MigrateStatusCommand } from "./commands/migrate-status-command.js";
import type { Command } from "./command.js";
import { MigrationRunner } from "./database/migration-runner.js";
import { Input } from "./input.js";
import { Output } from "./output.js";

/**
 * Console kernel — owns the CLI lifecycle.
 *
 * Mirrors Laravel's Illuminate\Foundation\Console\Kernel:
 *   1. bootstrap() registers built-in commands then loads routes/console.ts
 *   2. handle(argv) resolves + runs the matching command
 *   3. Returns an exit code (0 = success, non-zero = error)
 */
export class ConsoleKernel {
  private bootstrapped = false;
  private readonly out = new Output();

  constructor(private readonly app: ApplicationContract) {}

  async handle(argv: string[]): Promise<number> {
    await this.bootstrap();

    // argv = [node, script, command, ...rest]
    const args = argv.slice(2);
    const commandName = args[0];

    if (!commandName || commandName === "list") {
      return this.run(Artisan.resolve("list")!, []);
    }

    if (commandName === "--help" || commandName === "-h") {
      return this.run(Artisan.resolve("list")!, []);
    }

    const command = Artisan.resolve(commandName);
    if (!command) {
      this.out.error(`Command "${commandName}" not found.`);
      this.out.newLine();
      return this.run(Artisan.resolve("list")!, []);
    }

    return this.run(command, args.slice(1));
  }

  /**
   * Programmatically call a command — equivalent to Artisan::call().
   *
   *   await kernel.call("db:seed", ["--class=UserSeeder"]);
   */
  async call(name: string, args: string[] = []): Promise<number> {
    await this.bootstrap();
    const command = Artisan.resolve(name);
    if (!command) throw new Error(`Command "${name}" not found.`);
    return this.run(command, args);
  }

  // ------------------------------------------------------------------
  // Bootstrap
  // ------------------------------------------------------------------

  private async bootstrap(): Promise<void> {
    if (this.bootstrapped) return;
    this.bootstrapped = true;

    await this.registerBuiltins();

    const { commands } = this.app.routing;
    if (commands) {
      const abs = resolve(this.app.basePath, commands);
      await import(pathToFileURL(abs).href);
    }
  }

  private async registerBuiltins(): Promise<void> {
    // Meta
    Artisan.register(new ListCommand());
    Artisan.register(new HelpCommand());
    Artisan.register(new MakeCommandCommand(this.app));

    // Database commands — only when database config is present in the app
    if (this.app.config?.has("database")) {
      const runner = await this.makeRunner();
      Artisan.register(new MigrateCommand(runner));
      Artisan.register(new MigrateRollbackCommand(runner));
      Artisan.register(new MigrateFreshCommand(runner, this.app));
      Artisan.register(new MigrateStatusCommand(runner));
      Artisan.register(new DbSeedCommand(this.app));
    }
  }

  private async makeRunner(): Promise<MigrationRunner> {
    const { DatabaseManager } = await import("@madda/database");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dbConfig = this.app.config!.get<any>("database");
    const db = new DatabaseManager({
      ...dbConfig,
      basePath: this.app.basePath,
    });
    db.bootModels();
    return new MigrationRunner(this.app.basePath, db);
  }

  // ------------------------------------------------------------------
  // Run
  // ------------------------------------------------------------------

  private async run(command: Command, argv: string[]): Promise<number> {
    command._boot(new Input(argv, command.getParsed()), this.out);
    const result = await command.handle();
    return typeof result === "number" ? result : 0;
  }
}
