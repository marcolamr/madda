export type VerifiedApiToken = {
  userId: string;
  tokenId: string;
};

/**
 * Tokens API estilo Sanctum: `issue` devolve texto a mostrar uma vez; `verify` valida o Bearer.
 */
export interface ApiTokenRepository {
  issue(userId: string): Promise<{ plainToken: string; tokenId: string }>;

  verify(plainToken: string): Promise<VerifiedApiToken | null>;

  revoke(tokenId: string): Promise<void>;
}
