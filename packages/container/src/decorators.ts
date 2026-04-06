import { getDesignParamTypes } from "@madda/reflection";
import type { Token } from "./types.js";

/** Metadata map: parameter index → explicit inject token (Laravel-style contextual resolution hooks later). */
export const INJECT_METADATA_KEY = Symbol.for("madda.container.inject");

/**
 * Marks a constructor parameter to resolve from the container.
 * Without `token`, uses `emitDecoratorMetadata` type hint (constructor tokens only).
 */
export function Inject(token?: Token): ParameterDecorator {
  return (target, _propertyKey, parameterIndex) => {
    const ctor = (target as { constructor: abstract new (...args: unknown[]) => unknown })
      .constructor;
    const existing =
      (Reflect.getMetadata(INJECT_METADATA_KEY, ctor) as Record<number, Token> | undefined) ??
      {};
    if (token !== undefined) {
      existing[parameterIndex] = token;
    } else {
      const paramTypes = getDesignParamTypes(ctor);
      const inferred = paramTypes[parameterIndex] as Token | undefined;
      if (inferred !== undefined) {
        existing[parameterIndex] = inferred;
      }
    }
    Reflect.defineMetadata(INJECT_METADATA_KEY, existing, ctor);
  };
}
