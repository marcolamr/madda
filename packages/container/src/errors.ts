import type { Token } from "./types.js";

function tokenLabel(token: Token): string {
  if (typeof token === "string") {
    return token;
  }
  if (typeof token === "symbol") {
    return token.description ?? String(token);
  }
  if (typeof token === "function") {
    return token.name || "AnonymousClass";
  }
  return String(token);
}

export class BindingNotFoundError extends Error {
  readonly token: Token;

  constructor(token: Token) {
    super(`No binding registered for token: ${tokenLabel(token)}`);
    this.name = "BindingNotFoundError";
    this.token = token;
  }
}

export class CircularDependencyError extends Error {
  readonly token: Token;

  constructor(token: Token) {
    super(`Circular dependency while resolving: ${tokenLabel(token)}`);
    this.name = "CircularDependencyError";
    this.token = token;
  }
}
