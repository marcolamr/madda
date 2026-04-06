export {
  formatEmailAddress,
  normalizeRecipientList,
  parseEmailAddress,
  type EmailAddress,
} from "./address.js";
export {
  InvalidMailMessageError,
  MailMisconfiguredError,
  MailSendError,
} from "./errors.js";
export { MailManager } from "./mail-manager.js";
export { Mailer } from "./mailer.js";
export type { MailTransport } from "./mail-transport-contract.js";
export {
  assertSendableMail,
  formatRecipientHeader,
  withDefaultFrom,
  type OutgoingMail,
} from "./outgoing-mail.js";
export { fillTemplate } from "./template.js";
export { LogMailTransport } from "./transports/log-mail-transport.js";
export { MailtrapApiMailTransport } from "./transports/mailtrap-api-mail-transport.js";
export type { MailtrapApiMailTransportOptions } from "./transports/mailtrap-api-mail-transport.js";
export { ResendMailTransport } from "./transports/resend-mail-transport.js";
export type { ResendMailTransportOptions } from "./transports/resend-mail-transport.js";
export { SmtpMailTransport } from "./transports/smtp-mail-transport.js";
export type { SmtpMailTransportOptions } from "./transports/smtp-mail-transport.js";
export { createMailManagerFromConfig, type CreateMailManagerOptions } from "./factory.js";
