import type { ConnectionContract } from "@madda/database";
import { InvalidNotificationTableNameError } from "./errors.js";

export type DatabaseNotificationInsert = {
  type: string;
  notifiableType: string;
  notifiableId: string;
  data: Record<string, unknown>;
};

const SAFE_SQL_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Persiste linhas na tabela `notifications` (canal `database`).
 */
export class DatabaseNotificationStore {
  constructor(
    private readonly connection: ConnectionContract,
    private readonly table: string,
  ) {
    if (!SAFE_SQL_IDENT.test(table)) {
      throw new InvalidNotificationTableNameError();
    }
  }

  async insert(row: DatabaseNotificationInsert): Promise<void> {
    const sql = `insert into "${this.table}" ("type", "notifiable_type", "notifiable_id", "data", "read_at", "created_at")
      values (?, ?, ?, ?, null, datetime('now'))`;
    await this.connection.statement(sql, [
      row.type,
      row.notifiableType,
      row.notifiableId,
      JSON.stringify(row.data),
    ]);
  }
}
