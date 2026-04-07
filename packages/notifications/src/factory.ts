import type { ConfigContract, NotificationConfigShape } from "@madda/config";
import type { LocalBroadcastHub } from "@madda/broadcasting";
import type { ConnectionContract } from "@madda/database";
import type { Mailer } from "@madda/mail";
import { DatabaseNotificationStore } from "./database-notification-store.js";
import { createNotificationSender, type NotificationSender } from "./notification-sender.js";

const DEFAULT_TABLE = "notifications";
const DEFAULT_MORPH = "notifiable";

export type CreateNotificationSenderFromConfigInput = {
  config: ConfigContract;
  mailer?: Mailer;
  broadcastHub?: LocalBroadcastHub;
  connection?: ConnectionContract;
};

/**
 * Compõe {@link NotificationSender} a partir de `notifications.*` em config e dependências injectadas.
 */
export function createNotificationSenderFromConfig(
  input: CreateNotificationSenderFromConfigInput,
): NotificationSender {
  const raw = (input.config.get("notifications", {}) as Partial<NotificationConfigShape>) ?? {};
  const table = raw.table ?? DEFAULT_TABLE;
  const defaultNotifiableType = raw.default_notifiable_type ?? DEFAULT_MORPH;

  let databaseStore: DatabaseNotificationStore | undefined;
  if (input.connection) {
    databaseStore = new DatabaseNotificationStore(input.connection, table);
  }

  return createNotificationSender({
    mailer: input.mailer,
    broadcastHub: input.broadcastHub,
    databaseStore,
    defaultNotifiableType,
  });
}
