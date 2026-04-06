import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import type { ApiTokenRepository, VerifiedApiToken } from "./api-token-repository.js";

type Row = { userId: string; secretHash: Buffer };

function sha256Utf8(s: string): Buffer {
  return createHash("sha256").update(s, "utf8").digest();
}

/**
 * Armazenamento em memória (testes / single-node). Para produção multi-instância, implementar
 * {@link ApiTokenRepository} com BD (tabela `personal_access_tokens`).
 */
export class MemoryApiTokenStore implements ApiTokenRepository {
  private readonly rows = new Map<string, Row>();

  async issue(userId: string): Promise<{ plainToken: string; tokenId: string }> {
    const tokenId = randomUUID();
    const secret = randomBytes(32).toString("base64url");
    const plainToken = `${tokenId}|${secret}`;
    this.rows.set(tokenId, { userId, secretHash: sha256Utf8(secret) });
    return { plainToken, tokenId };
  }

  async verify(plainToken: string): Promise<VerifiedApiToken | null> {
    const pipe = plainToken.indexOf("|");
    if (pipe <= 0) {
      return null;
    }
    const tokenId = plainToken.slice(0, pipe);
    const secret = plainToken.slice(pipe + 1);
    const row = this.rows.get(tokenId);
    if (!row) {
      return null;
    }
    const h = sha256Utf8(secret);
    if (h.length !== row.secretHash.length || !timingSafeEqual(h, row.secretHash)) {
      return null;
    }
    return { userId: row.userId, tokenId };
  }

  async revoke(tokenId: string): Promise<void> {
    this.rows.delete(tokenId);
  }
}
