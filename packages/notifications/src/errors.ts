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
