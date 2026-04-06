import type { OutgoingMail } from "./outgoing-mail.js";

export interface MailTransport {
  send(mail: OutgoingMail): Promise<void>;
}
