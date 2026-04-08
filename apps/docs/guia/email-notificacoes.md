# E-mail e notificações

## Mail (`@madda/mail`)

- **`MailManager`** com múltiplos *mailers* e canais (`log`, `smtp`, Resend, Mailtrap API/SMTP).
- Config em `MailConfigShape` (`config/mail.ts` na app).
- Templates simples com `fillTemplate` (`{{ chave }}`) — ver também `@madda/view`.

Útil para *transactional email* e desenvolvimento com transporte `log`.

## Notifications (`@madda/notifications`)

O **`NotificationSender`** despacha para canais:

- **mail** — usa o `Mailer` injectado.
- **database** — persiste linhas (tabela configurável, identificadores SQL validados).
- **broadcast** — emite no `LocalBroadcastHub` quando configurado.

`createNotificationSenderFromConfig` compõe o remetente a partir da config e dependências opcionais (mailer, hub, conexão DB).

### Fluxo típico

1. Define uma classe de notificação com `toMail` / `toDatabase` / `toBroadcast`.
2. Resolve o `NotificationSender` no bootstrap ou contentor.
3. Chama `send(notifiable, notification)` a partir de handlers HTTP ou jobs em fila.
