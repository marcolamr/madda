import { MailMisconfiguredError } from "./errors.js";
import { Mailer } from "./mailer.js";
import type { OutgoingMail } from "./outgoing-mail.js";

export class MailManager {
  constructor(
    private readonly defaultName: string,
    private readonly mailers: Map<string, Mailer>,
  ) {}

  mailer(name?: string): Mailer {
    const n = name ?? this.defaultName;
    const m = this.mailers.get(n);
    if (!m) {
      throw new MailMisconfiguredError(n, `unknown mailer (available: ${[...this.mailers.keys()].join(", ")})`);
    }
    return m;
  }

  send(mail: OutgoingMail): Promise<void> {
    return this.mailer().send(mail);
  }

  mailerNames(): string[] {
    return [...this.mailers.keys()];
  }
}
