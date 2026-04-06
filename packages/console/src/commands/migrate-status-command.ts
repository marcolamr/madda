import { Command } from "../command.js";
import type { MigrationRunner } from "../database/migration-runner.js";

export class MigrateStatusCommand extends Command {
  readonly signature = "migrate:status";
  readonly description = "Show the status of each migration";

  constructor(private readonly runner: MigrationRunner) {
    super();
  }

  async handle(): Promise<void> {
    const rows = await this.runner.status();

    if (rows.length === 0) {
      this.info("No migration files found.");
      return;
    }

    this.newLine();
    this.line(
      `  ${"Migration".padEnd(50)} ${"Batch".padEnd(8)} Status`,
    );
    this.line(`  ${"-".repeat(70)}`);

    for (const row of rows) {
      const status = row.ran
        ? `\x1b[32mRan\x1b[0m`
        : `\x1b[33mPending\x1b[0m`;
      const batch = row.batch !== undefined ? String(row.batch) : "-";
      this.line(`  ${row.migration.padEnd(50)} ${batch.padEnd(8)} ${status}`);
    }

    this.newLine();
  }
}
