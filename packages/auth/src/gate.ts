import { HttpException } from "@madda/http";
import type { AuthenticatedUser } from "./types.js";

export type GateHandler = (user: AuthenticatedUser, ...args: unknown[]) => boolean;

/**
 * Autorização mínima (mentalidade Laravel `Gate::define`).
 * Regras de negócio complexas podem viver à parte; entrada pode ser validada com `@madda/validation`.
 */
export class Gate {
  private readonly handlers = new Map<string, GateHandler>();

  define(ability: string, handler: GateHandler): this {
    this.handlers.set(ability, handler);
    return this;
  }

  forget(ability: string): this {
    this.handlers.delete(ability);
    return this;
  }

  allows(user: AuthenticatedUser | undefined, ability: string, ...args: unknown[]): boolean {
    if (!user) {
      return false;
    }
    const fn = this.handlers.get(ability);
    if (!fn) {
      return false;
    }
    return fn(user, ...args);
  }

  authorize(user: AuthenticatedUser | undefined, ability: string, ...args: unknown[]): void {
    if (!this.allows(user, ability, ...args)) {
      throw new HttpException(403, "Forbidden", { message: "Forbidden" });
    }
  }
}
