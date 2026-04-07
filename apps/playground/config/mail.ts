import type { MailConfigShape } from "@madda/config";

/**
 * Mailer por defeito `log` — adequado ao playground; transportes reais via env em produto.
 */
const mailConfig = {
  default: "log",
  from: { address: "playground@example.test", name: "Playground" },
  mailers: {
    log: { driver: "log" },
  },
} satisfies MailConfigShape;

export default mailConfig;
