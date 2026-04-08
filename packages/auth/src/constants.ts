/** Utilizador autenticado em `HttpContext.state`. */
export const AUTH_USER_STATE_KEY = "madda.auth.user";

/** Como foi autenticado: `session` ou `api_token`. */
export const AUTH_VIA_STATE_KEY = "madda.auth.via";

/** Chave por defeito na sessão (`Session`, pacote `@madda/session`) para o id do utilizador (string). */
export const DEFAULT_SESSION_USER_KEY = "madda_auth_user_id";
