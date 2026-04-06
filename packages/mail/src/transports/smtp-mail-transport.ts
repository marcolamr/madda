import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { formatEmailAddress, normalizeRecipientList } from "../address.js";
import type { MailTransport } from "../mail-transport-contract.js";
import { formatRecipientHeader, type OutgoingMail } from "../outgoing-mail.js";

export type SmtpMailTransportOptions = {
  host: string;
  port?: number;
  secure?: boolean;
  requireTls?: boolean;
  username?: string;
  password?: string;
};

export class SmtpMailTransport implements MailTransport {
  private readonly transporter: Transporter;

  constructor(opts: SmtpMailTransportOptions) {
    this.transporter = nodemailer.createTransport({
      host: opts.host,
      port: opts.port,
      secure: opts.secure ?? false,
      requireTLS: opts.requireTls ?? false,
      auth:
        opts.username !== undefined && opts.password !== undefined
          ? { user: opts.username, pass: opts.password }
          : undefined,
    });
  }

  async send(mail: OutgoingMail): Promise<void> {
    await this.transporter.sendMail({
      from: formatEmailAddress(mail.from!),
      to: formatRecipientHeader(normalizeRecipientList(mail.to)),
      cc:
        normalizeRecipientList(mail.cc).length > 0
          ? formatRecipientHeader(normalizeRecipientList(mail.cc))
          : undefined,
      bcc:
        normalizeRecipientList(mail.bcc).length > 0
          ? formatRecipientHeader(normalizeRecipientList(mail.bcc))
          : undefined,
      replyTo: mail.replyTo ? formatEmailAddress(mail.replyTo) : undefined,
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
    });
  }
}
