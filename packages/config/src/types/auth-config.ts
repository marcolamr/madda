/** Ordem dos “guards” ao resolver o utilizador (por defeito Bearer → sessão). */
export type AuthGuardStep = "bearer" | "session";

/** Forma esperada em `config/auth` (ou equivalente). */
export interface AuthConfigShape {
  session?: {
    /** Chave na sessão onde está o id do utilizador (por defeito `madda_auth_user_id`). */
    user_key?: string;
  };
  /** Ordem de tentativa: ex. `['bearer','session']` para API + web. */
  guard_order?: AuthGuardStep[];
}
