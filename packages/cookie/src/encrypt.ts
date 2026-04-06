import type { Encrypter } from "@madda/encryption";

export function encryptCookieValue(encrypter: Encrypter, plain: string): string {
  return encrypter.encryptString(plain);
}

export function decryptCookieValue(encrypter: Encrypter, payload: string): string {
  return encrypter.decryptString(payload);
}
