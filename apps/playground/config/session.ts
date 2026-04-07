import type { SessionConfigShape } from "@madda/config";

/**
 * Sessão tipo Laravel — cookie httpOnly, ficheiro sob `storage/framework/sessions`.
 */
const sessionConfig = {
  driver: "file",
  cookie: "madda_session",
  path: "/",
  http_only: true,
  same_site: "lax",
  lifetime: 7200,
} satisfies SessionConfigShape;

export default sessionConfig;
