/**
 * Entidade que pode receber notificações (utilizador, equipa, …).
 * Mapeia para `notifiable_id` / routing de e-mail.
 */
export type Notifiable = {
  /** Identificador estável na aplicação (ex. PK do utilizador como string). */
  notificationId: string;
  /** Endereço para o canal `mail` quando a notificação não fixa `to` sozinha. */
  notificationEmail?: string;
};
