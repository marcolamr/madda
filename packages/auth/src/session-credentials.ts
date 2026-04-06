import type { HashManager } from "@madda/hashing";
import type { Session } from "@madda/session";
import { DEFAULT_SESSION_USER_KEY } from "./constants.js";

/**
 * Grava o id do utilizador na sessão (fluxo web). Chama `session.regenerate()` primeiro
 * para mitigar fixation (recomendado após login bem-sucedido).
 */
export function sessionLogin(
  session: Session,
  userId: string,
  options?: { sessionKey?: string; regenerate?: boolean },
): void {
  if (options?.regenerate !== false) {
    session.regenerate();
  }
  session.set(options?.sessionKey ?? DEFAULT_SESSION_USER_KEY, userId);
}

export function sessionLogout(session: Session, sessionKey = DEFAULT_SESSION_USER_KEY): void {
  session.forget(sessionKey);
}

/**
 * Verifica password com {@link HashManager} e, se válido, faz login na sessão.
 */
export async function attemptSessionLogin(
  session: Session,
  userId: string,
  plainPassword: string,
  passwordHash: string,
  hasher: HashManager,
  options?: { sessionKey?: string; regenerate?: boolean },
): Promise<boolean> {
  const ok = await hasher.check(plainPassword, passwordHash);
  if (!ok) {
    return false;
  }
  sessionLogin(session, userId, options);
  return true;
}
