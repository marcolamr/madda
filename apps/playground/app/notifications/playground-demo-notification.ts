import type { OutgoingMail } from "@madda/mail";
import { Notification, type Notifiable } from "@madda/notifications";

const ALLOWED = new Set(["mail", "database", "broadcast"]);

/**
 * Notificação de demonstração — canais escolhidos no construtor (validados).
 */
export class PlaygroundDemoNotification extends Notification {
  constructor(
    private readonly message: string,
    private readonly channels: readonly string[],
  ) {
    super();
    for (const c of channels) {
      if (!ALLOWED.has(c)) {
        throw new Error(`Invalid notification channel: ${c}`);
      }
    }
  }

  via(_notifiable: Notifiable): readonly string[] {
    return this.channels;
  }

  toDatabase(_notifiable: Notifiable) {
    return {
      type: "PlaygroundDemoNotification",
      data: { message: this.message },
    };
  }

  toBroadcast(notifiable: Notifiable) {
    return {
      channel: `user.${notifiable.notificationId}`,
      event: "notification.demo",
      data: { message: this.message },
    };
  }

  toMail(notifiable: Notifiable): OutgoingMail {
    const to = notifiable.notificationEmail;
    if (!to) {
      throw new Error("notifiable.notificationEmail is required for mail channel");
    }
    return {
      to,
      subject: "[Playground] Demo notification",
      text: this.message,
    };
  }
}
