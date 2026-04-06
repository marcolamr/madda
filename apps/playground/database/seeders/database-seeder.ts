import { UserSeeder } from "./user-seeder.js";

/**
 * Root seeder — orchestrates all other seeders in the correct order.
 *
 * The CLI (future `madda db:seed`) will instantiate and call `run()` on this class.
 *
 * @example
 * ```ts
 * const seeder = new DatabaseSeeder();
 * await seeder.run();
 * ```
 */
export class DatabaseSeeder {
  async run(): Promise<void> {
    await this.call(new UserSeeder());
  }

  /** Run a seeder and surface its name for logging (CLI will handle this). */
  private async call(seeder: { run(): Promise<void> }): Promise<void> {
    await seeder.run();
  }
}
