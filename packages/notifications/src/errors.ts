export class UnknownNotificationChannelError extends Error {
  constructor(channel: string) {
    super(`Unknown notification channel: ${channel}`);
    this.name = "UnknownNotificationChannelError";
  }
}

export class NotificationChannelMisconfiguredError extends Error {
  constructor(channel: string, detail: string) {
    super(`Notification channel "${channel}" is not configured: ${detail}`);
    this.name = "NotificationChannelMisconfiguredError";
  }
}

export class NotificationPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationPayloadError";
  }
}

/** Nome de tabela em `notifications.table` não é um identificador SQL seguro. */
export class InvalidNotificationTableNameError extends Error {
  constructor() {
    super(
      'Invalid notifications.database `table`: use only letters, digits and underscores (e.g. "notifications").',
    );
    this.name = "InvalidNotificationTableNameError";
  }
}
