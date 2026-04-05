import type { ValidationRuleContract } from "./validation-rule-contract.js";

/**
 * Laravel-style pipe string, a custom rule instance, or a list mixing both.
 */
export type RuleDefinition = string | ValidationRuleContract | RuleDefinition[];
