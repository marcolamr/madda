import type { MailTransport } from "../mail-transport-contract.js";
import type { OutgoingMail } from "../outgoing-mail.js";

/** Transport que grava mensagens em memória (testes). */
export class FakeMailTransport implements MailTransport {
  readonly sent: OutgoingMail[] = [];

  async send(mail: OutgoingMail): Promise<void> {
    this.sent.push(mail);
  }
}
