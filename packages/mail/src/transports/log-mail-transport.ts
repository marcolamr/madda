import type { Logger } from "pino";
import type { MailTransport } from "../mail-transport-contract.js";
import type { OutgoingMail } from "../outgoing-mail.js";

export class LogMailTransport implements MailTransport {
  constructor(private readonly logger: Logger) {}

  async send(mail: OutgoingMail): Promise<void> {
    this.logger.info(
      {
        from: mail.from,
        to: mail.to,
        cc: mail.cc,
        bcc: mail.bcc,
        replyTo: mail.replyTo,
        subject: mail.subject,
        text: mail.text,
        html: mail.html,
      },
      "mail (log driver)",
    );
  }
}
