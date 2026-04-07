/**
 * Configuração opcional para persistência de notificações na BD (canal `database`).
 */
export type NotificationConfigShape = {
  /** Nome da tabela (por defeito `notifications`). */
  table?: string;
  /**
   * Valor de `notifiable_type` quando não é passado explicitamente ao enviar
   * (ex.: `user` ou `App\\Models\\User` alinhado a Laravel).
   */
  default_notifiable_type?: string;
};
