/** Endereço por defeito (`mail.from`) ou equivalente. */
export interface MailFromConfigShape {
  address: string;
  name?: string;
}

/** Variante SMTP do Mailtrap (caixa de teste vs envio). */
export type MailtrapSmtpPreset = "sandbox" | "live";

/** Uma entrada em `mail.mailers`. */
export type MailMailerConfigShape =
  | { driver: "log" }
  | {
      driver: "smtp";
      host: string;
      port?: number;
      /** TLS directo (ex.: 465). */
      secure?: boolean;
      /** STARTTLS típico em 587. */
      require_tls?: boolean;
      username?: string;
      password?: string;
    }
  | {
      driver: "resend";
      /** Chave API (`re_...`). */
      api_key: string;
      /** Por defeito `https://api.resend.com`. */
      base_url?: string;
    }
  | {
      driver: "mailtrap";
      mode: "smtp";
      /**
       * `sandbox` → captura na caixa de teste Mailtrap;
       * `live` → SMTP de envio Mailtrap;
       * string → host explícito.
       */
      smtp?: MailtrapSmtpPreset | string;
      username: string;
      password: string;
      port?: number;
      secure?: boolean;
      require_tls?: boolean;
    }
  | {
      driver: "mailtrap";
      mode: "api";
      /** Token Bearer da API de envio Mailtrap. */
      token: string;
      /** Por defeito `https://send.api.mailtrap.io`. */
      base_url?: string;
    };

/** Forma esperada em `config/mail` (ou equivalente). */
export interface MailConfigShape {
  /** Nome do mailer em `mailers` (por defeito `log`). */
  default?: string;
  /** Remetente por omissão se a mensagem não trouxer `from`. */
  from?: MailFromConfigShape;
  mailers?: Record<string, MailMailerConfigShape>;
}
