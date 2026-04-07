import type { MaddaAjv } from "./ajv-factory.js";
import { JsonSchemaValidationError } from "./errors.js";
import type { HttpRouteJsonSchema } from "./types.js";

export type CompiledHttpRouteSchema = {
  validateQuery?: (data: unknown) => void;
  validateParams?: (data: unknown) => void;
  validateBody?: (data: unknown) => void;
  validateHeaders?: (data: unknown) => void;
};

function wrapValidate(
  ajv: MaddaAjv,
  schema: Record<string, unknown>,
  part: string,
): (data: unknown) => void {
  const validate = ajv.compile(schema);
  return (data: unknown) => {
    if (!validate(data)) {
      const err = JsonSchemaValidationError.fromAjv(validate.errors);
      err.message = `${part}: ${err.message}`;
      throw err;
    }
  };
}

/**
 * Compila validadores AJV para as partes do pedido definidas no contrato.
 */
export function compileHttpRouteSchema(
  ajv: MaddaAjv,
  spec: HttpRouteJsonSchema,
): CompiledHttpRouteSchema {
  const out: CompiledHttpRouteSchema = {};
  if (spec.query) {
    out.validateQuery = wrapValidate(ajv, spec.query, "query");
  }
  if (spec.params) {
    out.validateParams = wrapValidate(ajv, spec.params, "params");
  }
  if (spec.body) {
    out.validateBody = wrapValidate(ajv, spec.body, "body");
  }
  if (spec.headers) {
    out.validateHeaders = wrapValidate(ajv, spec.headers, "headers");
  }
  return out;
}
