import type { ConfigContract, MailConfigShape, MailMailerConfigShape } from "@madda/config";
import pino, { type Logger } from "pino";
import { MailMisconfiguredError } from "./errors.js";
import { Mailer } from "./mailer.js";
import { MailManager } from "./mail-manager.js";
import type { MailTransport } from "./mail-transport-contract.js";
import { LogMailTransport } from "./transports/log-mail-transport.js";
import { MailtrapApiMailTransport } from "./transports/mailtrap-api-mail-transport.js";
import { ResendMailTransport } from "./transports/resend-mail-transport.js";
import { SmtpMailTransport } from "./transports/smtp-mail-transport.js";

const DEFAULT_MAILER = "log";

function defaultMailers(): Record<string, MailMailerConfigShape> {
  return {
    log: { driver: "log" },
  };
}

function mergeMailers(cfg: Partial<MailConfigShape>): Record<string, MailMailerConfigShape> {
  return {
    ...defaultMailers(),
    ...(cfg.mailers ?? {}),
  };
}

function resolveMailtrapSmtpHost(smtp?: string): string {
  if (smtp === undefined || smtp === "sandbox") {
    return "sandbox.smtp.mailtrap.io";
  }
  if (smtp === "live") {
    return "live.smtp.mailtrap.io";
  }
  return smtp;
}

function buildTransport(
  name: string,
  shape: MailMailerConfigShape,
  logger: Logger,
): MailTransport {
  switch (shape.driver) {
    case "log":
      return new LogMailTransport(logger.child({ mailer: name }));
    case "smtp":
      return new SmtpMailTransport({
        host: shape.host,
        port: shape.port ?? (shape.secure ? 465 : 587),
        secure: shape.secure ?? false,
        requireTls: shape.require_tls ?? false,
        username: shape.username,
        password: shape.password,
      });
    case "resend":
      return new ResendMailTransport({
        apiKey: shape.api_key,
        baseUrl: shape.base_url,
      });
    case "mailtrap":
      if (shape.mode === "smtp") {
        return new SmtpMailTransport({
          host: resolveMailtrapSmtpHost(shape.smtp),
          port: shape.port ?? (shape.secure ? 465 : 2525),
          secure: shape.secure ?? false,
          requireTls: shape.require_tls ?? false,
          username: shape.username,
          password: shape.password,
        });
      }
      return new MailtrapApiMailTransport({
        token: shape.token,
        baseUrl: shape.base_url,
      });
    default:
      throw new MailMisconfiguredError(
        name,
        `unknown driver "${(shape as MailMailerConfigShape & { driver: string }).driver}"`,
      );
  }
}

export type CreateMailManagerOptions = {
  /** Usado pelo mailer `log` e como fallback se não for passado um logger dedicado. */
  logger?: Logger;
};

/**
 * Constrói um `MailManager` a partir de `mail.default`, `mail.from` e `mail.mailers`.
 * Sem config no repositório, fica só o mailer `log`.
 */
export function createMailManagerFromConfig(
  config: ConfigContract,
  options?: CreateMailManagerOptions,
): MailManager {
  const mailCfg = (config.get("mail", {}) as Partial<MailConfigShape>) ?? {};
  const defaultName = mailCfg.default ?? DEFAULT_MAILER;
  const merged = mergeMailers(mailCfg);
  const globalFrom = mailCfg.from;

  const baseLogger = options?.logger ?? pino({ level: process.env.LOG_LEVEL ?? "info" });

  const map = new Map<string, Mailer>();
  for (const [name, shape] of Object.entries(merged)) {
    const transport = buildTransport(name, shape, baseLogger);
    map.set(name, new Mailer(transport, globalFrom));
  }

  if (!map.has(defaultName)) {
    throw new MailMisconfiguredError(
      defaultName,
      `mail.default points to missing mailer (have: ${[...map.keys()].join(", ")}).`,
    );
  }

  return new MailManager(defaultName, map);
}
