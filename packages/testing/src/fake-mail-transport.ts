import type { MailTransport, OutgoingMail } from "@madda/mail";

/** Transport que grava mensagens em memória (testes). */
export class FakeMailTransport implements MailTransport {
  readonly sent: OutgoingMail[] = [];

  async send(mail: OutgoingMail): Promise<void> {
    this.sent.push(mail);
  }
}
