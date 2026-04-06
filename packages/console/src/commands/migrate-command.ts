import { Command } from "../command.js";
import type { MigrationRunner } from "../database/migration-runner.js";

export class MigrateCommand extends Command {
  readonly signature = "migrate";
  readonly description = "Run the pending database migrations";

  constructor(private readonly runner: MigrationRunner) {
    super();
  }

  async handle(): Promise<void> {
    const ran = await this.runner.run();

    if (ran.length === 0) {
      this.info("Nothing to migrate.");
      return;
    }

    for (const file of ran) {
      this.line(`  \x1b[32mMIGRATED\x1b[0m  ${file.name}`);
    }

    this.newLine();
    this.success(`Ran ${ran.length} migration(s).`);
  }
}
