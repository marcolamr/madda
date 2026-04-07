import type { LocalBroadcastHub } from "@madda/broadcasting";
import type { Mailer } from "@madda/mail";
import type { OutgoingMail } from "@madda/mail";
import { DatabaseNotificationStore } from "./database-notification-store.js";
import {
  NotificationChannelMisconfiguredError,
  NotificationPayloadError,
  UnknownNotificationChannelError,
} from "./errors.js";
import type { Notifiable } from "./notifiable.js";
import { Notification } from "./notification.js";

const CH_MAIL = "mail";
const CH_DATABASE = "database";
const CH_BROADCAST = "broadcast";

export type NotificationSenderOptions = {
  mailer?: Mailer;
  broadcastHub?: LocalBroadcastHub;
  databaseStore?: DatabaseNotificationStore;
  /** Usado na coluna `notifiable_type` se `send(..., notifiableType)` não for passado. */
  defaultNotifiableType?: string;
};

/**
 * Envia uma {@link Notification} pelos canais declarados em `via()`.
 */
export class NotificationSender {
  constructor(private readonly options: NotificationSenderOptions) {}

  async send(
    notifiable: Notifiable,
    notification: Notification,
    notifiableType?: string,
  ): Promise<void> {
    const morph =
      notifiableType ?? this.options.defaultNotifiableType ?? "notifiable";
    const channels = notification.via(notifiable);
    for (const ch of channels) {
      switch (ch) {
        case CH_MAIL:
          await this.sendMail(notifiable, notification);
          break;
        case CH_DATABASE:
          await this.sendDatabase(notifiable, notification, morph);
          break;
        case CH_BROADCAST:
          await this.sendBroadcast(notifiable, notification);
          break;
        default:
          throw new UnknownNotificationChannelError(ch);
      }
    }
  }

  private async sendMail(notifiable: Notifiable, notification: Notification): Promise<void> {
    const mailer = this.options.mailer;
    if (!mailer) {
      throw new NotificationChannelMisconfiguredError(CH_MAIL, "Mailer is missing");
    }
    if (typeof notification.toMail !== "function") {
      throw new NotificationPayloadError(
        `Notification ${notification.constructor.name} has no toMail() for channel "${CH_MAIL}"`,
      );
    }
    const mail: OutgoingMail = notification.toMail(notifiable);
    await mailer.send(mail);
  }

  private async sendDatabase(
    notifiable: Notifiable,
    notification: Notification,
    notifiableType: string,
  ): Promise<void> {
    const store = this.options.databaseStore;
    if (!store) {
      throw new NotificationChannelMisconfiguredError(
        CH_DATABASE,
        "DatabaseNotificationStore is missing",
      );
    }
    if (typeof notification.toDatabase !== "function") {
      throw new NotificationPayloadError(
        `Notification ${notification.constructor.name} has no toDatabase() for channel "${CH_DATABASE}"`,
      );
    }
    const payload = notification.toDatabase(notifiable);
    await store.insert({
      type: payload.type,
      notifiableType,
      notifiableId: notifiable.notificationId,
      data: payload.data,
    });
  }

  private async sendBroadcast(notifiable: Notifiable, notification: Notification): Promise<void> {
    const hub = this.options.broadcastHub;
    if (!hub) {
      throw new NotificationChannelMisconfiguredError(
        CH_BROADCAST,
        "LocalBroadcastHub is missing",
      );
    }
    if (typeof notification.toBroadcast !== "function") {
      throw new NotificationPayloadError(
        `Notification ${notification.constructor.name} has no toBroadcast() for channel "${CH_BROADCAST}"`,
      );
    }
    const { channel, event, data } = notification.toBroadcast(notifiable);
    hub.publish(channel, event, data);
  }
}

export function createNotificationSender(options: NotificationSenderOptions): NotificationSender {
  return new NotificationSender(options);
}
