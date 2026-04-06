import { UserFactory } from "../factories/user-factory.js";

/**
 * Seeds the `users` table with realistic fake data.
 * The CLI (future `madda db:seed`) will call `run()`.
 */
export class UserSeeder {
  async run(): Promise<void> {
    await UserFactory.createMany(10);
  }
}
