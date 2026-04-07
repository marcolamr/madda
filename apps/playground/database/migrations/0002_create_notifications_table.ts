import type { ConnectionContract, Migration } from "@madda/database";

/**
 * Tabela `notifications` para o canal `database` de `@madda/notifications`
 * (equivalente a `notifications` no Laravel).
 */
export default class CreateNotificationsTable implements Migration {
  async up(connection: ConnectionContract): Promise<void> {
    await connection.run(`
      create table if not exists "notifications" (
        "id"                integer primary key autoincrement,
        "type"              text    not null,
        "notifiable_type"   text    not null,
        "notifiable_id"     text    not null,
        "data"              text    not null,
        "read_at"           text,
        "created_at"        text    not null default (datetime('now'))
      )
    `);
  }

  async down(connection: ConnectionContract): Promise<void> {
    await connection.run(`drop table if exists "notifications"`);
  }
}
