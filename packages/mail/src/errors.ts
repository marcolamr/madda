export class MailMisconfiguredError extends Error {
  constructor(
    readonly mailerName: string,
    message: string,
  ) {
    super(`Mailer "${mailerName}": ${message}`);
    this.name = "MailMisconfiguredError";
  }
}

export class InvalidMailMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMailMessageError";
  }
}

export class MailSendError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: string,
  ) {
    super(message);
    this.name = "MailSendError";
  }
}
