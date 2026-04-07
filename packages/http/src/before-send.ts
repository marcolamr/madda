/**
 * Lista de callbacks a correr no Fastify `onSend` antes do corpo sair (ex.: `Set-Cookie` de sessão).
 * Populada por middleware; lida pelo driver Fastify.
 */
export const HTTP_BEFORE_SEND_STATE_KEY = "madda.http.beforeSendCallbacks";

export type HttpBeforeSendCallback = () => void | Promise<void>;
