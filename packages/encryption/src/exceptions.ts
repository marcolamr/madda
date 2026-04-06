/** Thrown when encryption fails (Laravel `EncryptException`). */
export class EncryptException extends Error {
  readonly name = "EncryptException";

  constructor(message: string) {
    super(message);
  }
}

/** Thrown when decryption or MAC verification fails (Laravel `DecryptException`). */
export class DecryptException extends Error {
  readonly name = "DecryptException";

  constructor(message: string) {
    super(message);
  }
}

/** Thrown when `APP_KEY` is missing (Laravel `MissingAppKeyException`). */
export class MissingAppKeyException extends Error {
  readonly name = "MissingAppKeyException";

  constructor(message = "No application encryption key has been specified.") {
    super(message);
  }
}
