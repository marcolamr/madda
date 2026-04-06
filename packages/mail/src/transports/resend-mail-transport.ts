import { formatEmailAddress, normalizeRecipientList } from "../address.js";
import { MailSendError } from "../errors.js";
import type { MailTransport } from "../mail-transport-contract.js";
import type { OutgoingMail } from "../outgoing-mail.js";

const DEFAULT_BASE = "https://api.resend.com";

export type ResendMailTransportOptions = {
  apiKey: string;
  baseUrl?: string;
};

export class ResendMailTransport implements MailTransport {
  private readonly baseUrl: string;

  constructor(private readonly options: ResendMailTransportOptions) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, "");
  }

  async send(mail: OutgoingMail): Promise<void> {
    const body: Record<string, unknown> = {
      from: formatEmailAddress(mail.from!),
      to: normalizeRecipientList(mail.to).map((a) => formatEmailAddress(a)),
      subject: mail.subject,
    };
    if (mail.text !== undefined) {
      body.text = mail.text;
    }
    if (mail.html !== undefined) {
      body.html = mail.html;
    }
    if (mail.cc !== undefined && normalizeRecipientList(mail.cc).length > 0) {
      body.cc = normalizeRecipientList(mail.cc).map((a) => formatEmailAddress(a));
    }
    if (mail.bcc !== undefined && normalizeRecipientList(mail.bcc).length > 0) {
      body.bcc = normalizeRecipientList(mail.bcc).map((a) => formatEmailAddress(a));
    }
    if (mail.replyTo !== undefined) {
      body.reply_to = formatEmailAddress(mail.replyTo);
    }

    const res = await fetch(`${this.baseUrl}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new MailSendError(`Resend HTTP ${res.status}`, res.status, t);
    }
  }
}
