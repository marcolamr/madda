import type { MailFromConfigShape } from "@madda/config";
import {
  formatEmailAddress,
  normalizeRecipientList,
  type EmailAddress,
} from "./address.js";
import { InvalidMailMessageError } from "./errors.js";

export type OutgoingMail = {
  from?: EmailAddress;
  to: EmailAddress | EmailAddress[];
  cc?: EmailAddress | EmailAddress[];
  bcc?: EmailAddress | EmailAddress[];
  replyTo?: EmailAddress;
  subject: string;
  text?: string;
  html?: string;
};

export function withDefaultFrom(mail: OutgoingMail, from?: MailFromConfigShape): OutgoingMail {
  if (!from || mail.from !== undefined) {
    return mail;
  }
  return {
    ...mail,
    from: from.name ? { email: from.address, name: from.name } : from.address,
  };
}

export function assertSendableMail(mail: OutgoingMail): void {
  if (!mail.subject?.trim()) {
    throw new InvalidMailMessageError("Mail subject is required.");
  }
  if (normalizeRecipientList(mail.to).length === 0) {
    throw new InvalidMailMessageError("At least one `to` recipient is required.");
  }
  const hasBody = Boolean(mail.text?.trim()) || Boolean(mail.html?.trim());
  if (!hasBody) {
    throw new InvalidMailMessageError("Provide `text` and/or `html` body.");
  }
}

/** Cabeçalho `To` / `Cc` para SMTP (lista separada por vírgulas). */
export function formatRecipientHeader(list: EmailAddress[]): string {
  return list.map((a) => formatEmailAddress(a)).join(", ");
}
