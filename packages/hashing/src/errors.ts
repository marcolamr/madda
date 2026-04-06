/**
 * Thrown when `HashManager.check` rejects a hash because it was produced with a
 * different driver while verification is enabled (Laravel `HASH_VERIFY` behaviour).
 */
export class HashingDriverMismatchError extends Error {
  readonly name = "HashingDriverMismatchError";

  constructor(message: string) {
    super(message);
  }
}
