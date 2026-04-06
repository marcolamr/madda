import type { ConnectionContract } from "../connection/connection-contract.js";

/**
 * Every migration must implement these two methods.
 *
 * The CLI (future) will call `up()` when migrating forward and `down()`
 * when rolling back. Migrations receive the active connection so they stay
 * driver-agnostic — SQL is the only language they are allowed to speak.
 *
 * @example
 * ```ts
 * export default class CreateUsersTable implements Migration {
 *   async up(connection: ConnectionContract): Promise<void> {
 *     await connection.run(`create table "users" (...)`);
 *   }
 *
 *   async down(connection: ConnectionContract): Promise<void> {
 *     await connection.run(`drop table if exists "users"`);
 *   }
 * }
 * ```
 */
export interface Migration {
  up(connection: ConnectionContract): Promise<void>;
  down(connection: ConnectionContract): Promise<void>;
}
