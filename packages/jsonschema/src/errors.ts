import type { ErrorObject } from "ajv";

export type JsonSchemaIssue = {
  instancePath: string;
  schemaPath: string;
  keyword: string;
  message?: string;
  params?: Record<string, unknown>;
};

/**
 * Falha de validação JSON Schema no transporte HTTP — mapear a 400 no error handler.
 */
export class JsonSchemaValidationError extends Error {
  readonly issues: JsonSchemaIssue[];

  constructor(issues: JsonSchemaIssue[], message = "JSON Schema validation failed") {
    super(message);
    this.name = "JsonSchemaValidationError";
    this.issues = issues;
  }

  static fromAjv(errors: ErrorObject[] | null | undefined): JsonSchemaValidationError {
    const list = errors ?? [];
    const issues: JsonSchemaIssue[] = list.map((e) => ({
      instancePath: e.instancePath ?? "",
      schemaPath: e.schemaPath ?? "",
      keyword: e.keyword ?? "",
      message: e.message,
      params: e.params as Record<string, unknown> | undefined,
    }));
    return new JsonSchemaValidationError(issues);
  }
}
