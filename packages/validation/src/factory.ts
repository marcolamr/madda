import type { RuleDefinition } from "./rule-definition.js";
import { Validator } from "./validator.js";

export function createValidator<T extends Record<string, unknown>>(
  data: T,
  rules: Record<string, RuleDefinition>,
  messages?: Record<string, string>,
): Validator<T> {
  return new Validator(data, rules, messages);
}
