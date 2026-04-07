import type { HttpRouteJsonSchema } from "./types.js";

function querySchemaToParameters(schema: Record<string, unknown>): unknown[] {
  const props = schema.properties as Record<string, unknown> | undefined;
  if (!props) {
    return [];
  }
  const required = new Set(
    Array.isArray(schema.required) ? (schema.required as string[]) : [],
  );
  return Object.entries(props).map(([name, sch]) => ({
    name,
    in: "query" as const,
    required: required.has(name),
    schema: sch,
  }));
}

function pathSchemaToParameters(schema: Record<string, unknown>): unknown[] {
  const props = schema.properties as Record<string, unknown> | undefined;
  if (!props) {
    return [];
  }
  return Object.entries(props).map(([name, sch]) => ({
    name,
    in: "path" as const,
    required: true,
    schema: sch,
  }));
}

/**
 * Constrói um objeto [Operation Object](https://spec.openapis.org/oas/v3.1.0#operation-object) OpenAPI 3.1.
 */
export function openApiOperationFromSchema(
  spec: HttpRouteJsonSchema,
  options?: {
    operationId?: string;
    tags?: string[];
    summary?: string;
    description?: string;
  },
): Record<string, unknown> {
  const op: Record<string, unknown> = {};
  if (options?.tags) {
    op.tags = options.tags;
  }
  if (options?.summary) {
    op.summary = options.summary;
  }
  if (options?.description) {
    op.description = options.description;
  }
  if (options?.operationId) {
    op.operationId = options.operationId;
  }

  const parameters: unknown[] = [];
  if (spec.params && typeof spec.params === "object") {
    parameters.push(...pathSchemaToParameters(spec.params as Record<string, unknown>));
  }
  if (spec.query && typeof spec.query === "object") {
    parameters.push(...querySchemaToParameters(spec.query as Record<string, unknown>));
  }
  if (parameters.length > 0) {
    op.parameters = parameters;
  }

  if (spec.body) {
    op.requestBody = {
      required: true,
      content: {
        "application/json": { schema: spec.body },
      },
    };
  }

  const responses: Record<string, unknown> = {};
  if (spec.responses) {
    for (const [code, sch] of Object.entries(spec.responses)) {
      responses[code] = {
        description: `HTTP ${code}`,
        content: {
          "application/json": { schema: sch },
        },
      };
    }
  }
  if (Object.keys(responses).length === 0) {
    responses["200"] = { description: "OK" };
  }
  op.responses = responses;
  return op;
}

/** Converte segmentos `:id` do Madda/Fastify para `{id}` em OpenAPI. */
export function toOpenApiPathTemplate(routePath: string): string {
  const withSlash = routePath.startsWith("/") ? routePath : `/${routePath}`;
  return withSlash.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}

export type OpenApiDocument31 = {
  openapi: "3.1.0";
  info: { title: string; version: string; description?: string };
  paths: Record<string, Record<string, unknown>>;
};
