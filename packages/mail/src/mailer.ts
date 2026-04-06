import type { MailFromConfigShape } from "@madda/config";
import type { MailTransport } from "./mail-transport-contract.js";
import { assertSendableMail, withDefaultFrom, type OutgoingMail } from "./outgoing-mail.js";
import { InvalidMailMessageError } from "./errors.js";

export class Mailer {
  constructor(
    private readonly transport: MailTransport,
    private readonly defaultFrom?: MailFromConfigShape,
  ) {}

  async send(mail: OutgoingMail): Promise<void> {
    const m = withDefaultFrom(mail, this.defaultFrom);
    assertSendableMail(m);
    if (m.from === undefined) {
      throw new InvalidMailMessageError("Set `from` on the message or `mail.from` in application config.");
    }
    await this.transport.send(m);
  }
}
