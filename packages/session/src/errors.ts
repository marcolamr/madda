export class SessionStoreMisconfiguredError extends Error {
  constructor(
    readonly storeName: string,
    message: string,
  ) {
    super(`Session store "${storeName}": ${message}`);
    this.name = "SessionStoreMisconfiguredError";
  }
}
