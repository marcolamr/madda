import { normalizeRecipientList, parseEmailAddress } from "../address.js";
import { MailSendError } from "../errors.js";
import type { MailTransport } from "../mail-transport-contract.js";
import type { OutgoingMail } from "../outgoing-mail.js";

const DEFAULT_BASE = "https://send.api.mailtrap.io";

export type MailtrapApiMailTransportOptions = {
  token: string;
  baseUrl?: string;
};

function toMailtrapPartyList(list: ReturnType<typeof normalizeRecipientList>): { email: string; name?: string }[] {
  return list.map((a) => {
    const p = parseEmailAddress(a);
    return p.name ? { email: p.email, name: p.name } : { email: p.email };
  });
}

export class MailtrapApiMailTransport implements MailTransport {
  private readonly baseUrl: string;

  constructor(private readonly options: MailtrapApiMailTransportOptions) {
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE).replace(/\/$/, "");
  }

  async send(mail: OutgoingMail): Promise<void> {
    const from = parseEmailAddress(mail.from!);
    const payload: Record<string, unknown> = {
      from: from.name ? { email: from.email, name: from.name } : { email: from.email },
      to: toMailtrapPartyList(normalizeRecipientList(mail.to)),
      subject: mail.subject,
    };
    if (mail.text !== undefined) {
      payload.text = mail.text;
    }
    if (mail.html !== undefined) {
      payload.html = mail.html;
    }
    const cc = toMailtrapPartyList(normalizeRecipientList(mail.cc));
    if (cc.length > 0) {
      payload.cc = cc;
    }
    const bcc = toMailtrapPartyList(normalizeRecipientList(mail.bcc));
    if (bcc.length > 0) {
      payload.bcc = bcc;
    }
    if (mail.replyTo !== undefined) {
      const r = parseEmailAddress(mail.replyTo);
      payload.reply_to = r.name ? { email: r.email, name: r.name } : { email: r.email };
    }

    const res = await fetch(`${this.baseUrl}/api/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.options.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new MailSendError(`Mailtrap API HTTP ${res.status}`, res.status, t);
    }
  }
}
