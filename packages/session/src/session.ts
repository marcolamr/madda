import { randomBytes } from "node:crypto";
import { FLASH_PENDING_KEY, type SessionData } from "./session-types.js";

export { FLASH_PENDING_KEY, type SessionData } from "./session-types.js";

export function randomSessionId(): string {
  return randomBytes(16).toString("base64url");
}

export class Session {
  private readonly ephemeralKeys = new Set<string>();
  private flashPending: Record<string, unknown> = {};
  private dirty = false;
  private replacedSessionId?: string;

  private constructor(
    public id: string,
    private data: Record<string, unknown>,
  ) {}

  static fromStore(id: string, stored: SessionData | null): Session {
    const raw: SessionData = { ...(stored ?? {}) };
    const pending = raw[FLASH_PENDING_KEY];
    delete raw[FLASH_PENDING_KEY];
    const data = { ...raw };
    const session = new Session(id, data);
    if (pending && typeof pending === "object" && !Array.isArray(pending)) {
      for (const [k, v] of Object.entries(pending as Record<string, unknown>)) {
        session.data[k] = v;
        session.ephemeralKeys.add(k);
      }
    }
    return session;
  }

  get<T = unknown>(key: string): T | undefined {
    return this.data[key] as T | undefined;
  }

  set(key: string, value: unknown): void {
    this.data[key] = value;
    this.ephemeralKeys.delete(key);
    this.dirty = true;
  }

  forget(key: string): void {
    delete this.data[key];
    delete this.flashPending[key];
    this.ephemeralKeys.delete(key);
    this.dirty = true;
  }

  all(): Readonly<Record<string, unknown>> {
    return { ...this.data };
  }

  /**
   * Disponível neste pedido via `get` e no pedido seguinte (depois de persistir).
   */
  flash(key: string, value: unknown): void {
    this.data[key] = value;
    this.flashPending[key] = value;
    this.ephemeralKeys.delete(key);
    this.dirty = true;
  }

  regenerate(): void {
    this.replacedSessionId = this.id;
    this.id = randomSessionId();
    this.dirty = true;
  }

  /**
   * ID substituído por `regenerate()`, consumido uma vez pelo middleware ao persistir.
   */
  takeReplacedSessionId(): string | undefined {
    const v = this.replacedSessionId;
    this.replacedSessionId = undefined;
    return v;
  }

  isDirty(): boolean {
    return this.dirty;
  }

  toStore(): SessionData {
    const out: SessionData = { ...this.data };
    for (const k of this.ephemeralKeys) {
      delete out[k];
    }
    for (const k of Object.keys(this.flashPending)) {
      delete out[k];
    }
    if (Object.keys(this.flashPending).length > 0) {
      out[FLASH_PENDING_KEY] = { ...this.flashPending };
    }
    return out;
  }
}
