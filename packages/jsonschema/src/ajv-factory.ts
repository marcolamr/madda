import { Ajv } from "ajv";
import type { Options } from "ajv";
import * as addFormatsModule from "ajv-formats";

const defaultOptions: Options = {
  allErrors: true,
  coerceTypes: true,
  strict: false,
  validateSchema: true,
};

/** CJS default `ajv-formats` sob NodeNext. */
const addFormats = addFormatsModule.default as unknown as (ajv: Ajv) => Ajv;

export type MaddaAjv = Ajv;

let singleton: MaddaAjv | undefined;

/**
 * Instância AJV partilhada (draft-2020-12) com formatos (`date-time`, `uuid`, …).
 */
export function getDefaultAjv(): MaddaAjv {
  if (!singleton) {
    singleton = new Ajv(defaultOptions);
    addFormats(singleton);
  }
  return singleton;
}

/** Para testes ou configuração isolada. */
export function createAjv(options?: Options): MaddaAjv {
  const ajv = new Ajv({ ...defaultOptions, ...options });
  addFormats(ajv);
  return ajv;
}
