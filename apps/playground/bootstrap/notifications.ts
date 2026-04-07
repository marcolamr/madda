import { createMailManagerFromConfig } from "@madda/mail";
import { createNotificationSenderFromConfig, type NotificationSender } from "@madda/notifications";
import { app } from "./app.js";
import { getPlaygroundDatabase } from "./database.js";
import { playgroundBroadcastHub } from "./play-broadcast-hub.js";
import CreateNotificationsTable from "../database/migrations/0002_create_notifications_table.js";

let cached: NotificationSender | undefined;
let schemaEnsured = false;

async function ensureNotificationsTable(): Promise<void> {
  if (schemaEnsured) {
    return;
  }
  const db = getPlaygroundDatabase();
  if (db) {
    await new CreateNotificationsTable().up(db.connection());
  }
  schemaEnsured = true;
}

/**
 * `NotificationSender` do playground (mail + BD + hub em memória).
 * Garante a tabela `notifications` na primeira utilização.
 */
export async function getPlaygroundNotificationSender(): Promise<NotificationSender | undefined> {
  const cfg = app.config;
  if (!cfg) {
    return undefined;
  }
  await ensureNotificationsTable();
  if (!cached) {
    const mailManager = createMailManagerFromConfig(cfg);
    cached = createNotificationSenderFromConfig({
      config: cfg,
      mailer: mailManager.mailer(),
      broadcastHub: playgroundBroadcastHub,
      connection: getPlaygroundDatabase()?.connection(),
    });
  }
  return cached;
}
