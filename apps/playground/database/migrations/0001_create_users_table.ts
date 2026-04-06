import type { ConnectionContract, Migration } from "@madda/database";

/**
 * Create the `users` table.
 *
 * The CLI (future `madda migrate`) will call `up()` when migrating forward
 * and `down()` when rolling back. Column shape mirrors Laravel's default
 * users blueprint.
 */
export default class CreateUsersTable implements Migration {
  async up(connection: ConnectionContract): Promise<void> {
    await connection.run(`
      create table if not exists "users" (
        "id"                integer primary key autoincrement,
        "name"              text    not null,
        "email"             text    not null unique,
        "email_verified_at" text,
        "password"          text    not null,
        "remember_token"    text,
        "created_at"        text,
        "updated_at"        text
      )
    `);
  }

  async down(connection: ConnectionContract): Promise<void> {
    await connection.run(`drop table if exists "users"`);
  }
}
