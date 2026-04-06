import type { SessionData } from "./session-types.js";

export interface SessionStore {
  read(sessionId: string): Promise<SessionData | null>;

  write(sessionId: string, data: SessionData, ttlSeconds: number): Promise<void>;

  destroy(sessionId: string): Promise<void>;
}
