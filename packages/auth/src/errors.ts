export class AuthMisconfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthMisconfiguredError";
  }
}
