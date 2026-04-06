import { Command } from "../command.js";
import type { MigrationRunner } from "../database/migration-runner.js";

export class MigrateRollbackCommand extends Command {
  readonly signature = "migrate:rollback {--step=1 : Number of batches to roll back}";
  readonly description = "Roll back the last database migration batch";

  constructor(private readonly runner: MigrationRunner) {
    super();
  }

  async handle(): Promise<void> {
    const step = Number(this.option("step") ?? 1);
    const rolled = await this.runner.rollback(step);

    if (rolled.length === 0) {
      this.info("Nothing to roll back.");
      return;
    }

    for (const file of rolled) {
      this.line(`  \x1b[31mROLLED BACK\x1b[0m  ${file.name}`);
    }

    this.newLine();
    this.success(`Rolled back ${rolled.length} migration(s).`);
  }
}
