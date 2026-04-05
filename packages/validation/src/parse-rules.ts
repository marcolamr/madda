import type { ValidationRuleContract } from "./validation-rule-contract.js";
import type { RuleDefinition } from "./rule-definition.js";

export type StringRuleSegment = { kind: "string"; name: string; params: string[] };
export type ObjectRuleSegment = { kind: "object"; rule: ValidationRuleContract };
export type NormalizedRuleSegment = StringRuleSegment | ObjectRuleSegment;

export function parsePipeString(ruleString: string): StringRuleSegment[] {
  return ruleString
    .split("|")
    .map((raw) => raw.trim())
    .filter((s) => s.length > 0)
    .map((raw) => {
      const colon = raw.indexOf(":");
      if (colon === -1) {
        return { kind: "string" as const, name: raw, params: [] };
      }
      const name = raw.slice(0, colon).trim();
      const rest = raw.slice(colon + 1);
      const params = rest.split(",").map((p) => p.trim());
      return { kind: "string" as const, name, params };
    });
}

export function normalizeRuleDefinition(def: RuleDefinition): NormalizedRuleSegment[] {
  if (typeof def === "string") {
    return parsePipeString(def);
  }
  if (Array.isArray(def)) {
    return def.flatMap((d) => normalizeRuleDefinition(d));
  }
  return [{ kind: "object", rule: def }];
}
