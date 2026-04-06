import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { type CipherName, normalizeCipherName, SUPPORTED_CIPHERS } from "./cipher.js";
import {
  DecryptException,
  EncryptException,
  MissingAppKeyException,
} from "./exceptions.js";
import { parseAppKey } from "./parse-app-key.js";

type Payload = {
  iv: string;
  value: string;
  mac: string;
  tag: string;
};

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}

function macFor(ivB64: string, valueB64: string, key: Buffer): string {
  return createHmac("sha256", key).update(ivB64 + valueB64).digest("hex");
}

/**
 * OpenSSL AES-CBC + HMAC-SHA256, payload format compatible with Laravel's
 * {@link https://github.com/laravel/framework/blob/13.x/src/Illuminate/Encryption/Encrypter.php Encrypter}
 * for `encryptString` / `decryptString` (non-AEAD ciphers).
 *
 * @see https://laravel.com/docs/13.x/encryption
 */
export class Encrypter {
  private readonly cipher: CipherName;
  private readonly previousKeys: Buffer[];

  constructor(
    private readonly key: Buffer,
    cipher: string = "aes-256-cbc",
    previousKeys: Buffer[] = [],
  ) {
    this.cipher = normalizeCipherName(cipher);
    Encrypter.assertKeyLength(this.key, this.cipher);
    this.previousKeys = previousKeys;
    for (const k of this.previousKeys) {
      Encrypter.assertKeyLength(k, this.cipher);
    }
  }

  private static assertKeyLength(key: Buffer, cipher: CipherName): void {
    const spec = SUPPORTED_CIPHERS[cipher];
    if (key.length !== spec.keySize) {
      throw new EncryptException(
        `Encryption key must be ${spec.keySize} bytes for ${cipher}; got ${key.length}.`,
      );
    }
  }

  /** Random key as `base64:...` (Laravel `key:generate` / `Encrypter::generateKey`). */
  static generateFormattedKey(cipher: string | CipherName = "aes-256-cbc"): string {
    const name = typeof cipher === "string" ? normalizeCipherName(cipher) : cipher;
    const size = SUPPORTED_CIPHERS[name].keySize;
    return `base64:${randomBytes(size).toString("base64")}`;
  }

  /**
   * Build from `config/app`-style values (`APP_KEY`, `APP_PREVIOUS_KEYS`).
   */
  static fromConfig(input: {
    cipher: string;
    key: string | undefined;
    previous_keys?: string[];
  }): Encrypter {
    if (input.key === undefined || input.key === "") {
      throw new MissingAppKeyException();
    }
    const primary = parseAppKey(input.key);
    const cipher = normalizeCipherName(input.cipher);
    const prev = (input.previous_keys ?? []).map((k) => parseAppKey(k));
    return new Encrypter(primary, cipher, prev);
  }

  encryptString(value: string): string {
    const spec = SUPPORTED_CIPHERS[this.cipher];
    const iv = randomBytes(spec.ivLength);
    const cipher = createCipheriv(this.cipher, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
    const ivB64 = iv.toString("base64");
    const valueB64 = encrypted.toString("base64");
    const mac = macFor(ivB64, valueB64, this.key);
    const payload: Payload = { iv: ivB64, value: valueB64, mac, tag: "" };
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64");
  }

  decryptString(payload: string): string {
    const data = this.getJsonPayload(payload);
    if (data.tag !== "" && data.tag !== undefined) {
      throw new DecryptException("AEAD payloads are not supported in this build.");
    }

    const iv = Buffer.from(data.iv, "base64");
    if (iv.length !== SUPPORTED_CIPHERS[this.cipher].ivLength) {
      throw new DecryptException("The payload is invalid.");
    }

    const keys = [this.key, ...this.previousKeys];
    let foundValidMac = false;
    let decrypted: string | undefined;

    for (const keyBuf of keys) {
      foundValidMac =
        foundValidMac || timingSafeEqualHex(macFor(data.iv, data.value, keyBuf), data.mac);
      if (this.shouldValidateMac() && !foundValidMac) {
        continue;
      }
      try {
        const decipher = createDecipheriv(this.cipher, keyBuf, iv);
        const plain = Buffer.concat([
          decipher.update(Buffer.from(data.value, "base64")),
          decipher.final(),
        ]).toString("utf8");
        decrypted = plain;
        break;
      } catch {
        // try next key (Laravel openssl_decrypt may fail per key)
      }
    }

    if (this.shouldValidateMac() && !foundValidMac) {
      throw new DecryptException("The MAC is invalid.");
    }
    if (decrypted === undefined) {
      throw new DecryptException("Could not decrypt the data.");
    }
    return decrypted;
  }

  static appearsEncrypted(value: unknown): boolean {
    if (typeof value !== "string") {
      return false;
    }
    try {
      const raw = Buffer.from(value, "base64").toString("utf8");
      const p = JSON.parse(raw) as Record<string, unknown>;
      return (
        typeof p["iv"] === "string" &&
        typeof p["value"] === "string" &&
        typeof p["mac"] === "string"
      );
    } catch {
      return false;
    }
  }

  private getJsonPayload(payload: string): Payload {
    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
    } catch {
      throw new DecryptException("The payload is invalid.");
    }
    if (!this.validPayload(parsed)) {
      throw new DecryptException("The payload is invalid.");
    }
    return parsed as Payload;
  }

  private validPayload(payload: unknown): payload is Payload {
    if (payload === null || typeof payload !== "object") {
      return false;
    }
    const p = payload as Record<string, unknown>;
    for (const k of ["iv", "value", "mac"] as const) {
      if (typeof p[k] !== "string") {
        return false;
      }
    }
    if (p["tag"] !== undefined && typeof p["tag"] !== "string") {
      return false;
    }
    const iv = Buffer.from(String(p["iv"]), "base64");
    return iv.length === SUPPORTED_CIPHERS[this.cipher].ivLength;
  }

  private shouldValidateMac(): boolean {
    return !SUPPORTED_CIPHERS[this.cipher].aead;
  }
}
