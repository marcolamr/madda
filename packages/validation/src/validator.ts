import { builtinRules } from "./builtin-rules.js";
import {
  type NormalizedRuleSegment,
  normalizeRuleDefinition,
} from "./parse-rules.js";
import type { RuleDefinition } from "./rule-definition.js";
import { ValidationException } from "./validation-exception.js";
import type { ValidatorContract } from "./validator-contract.js";

function appendError(bag: Record<string, string[]>, attribute: string, message: string): void {
  if (!bag[attribute]) {
    bag[attribute] = [];
  }
  bag[attribute].push(message);
}

function hasNullable(segments: NormalizedRuleSegment[]): boolean {
  return segments.some((s) => s.kind === "string" && s.name === "nullable");
}

async function runSegment(
  segment: NormalizedRuleSegment,
  attribute: string,
  value: unknown,
  data: Record<string, unknown>,
  customMessages: Record<string, string>,
): Promise<string | null> {
  if (segment.kind === "object") {
    return segment.rule.validate(attribute, value, data);
  }

  if (segment.name === "nullable") {
    return null;
  }

  const fn = builtinRules[segment.name];
  if (!fn) {
    throw new Error(`Unknown validation rule: ${segment.name}`);
  }

  const defaultMsg = fn(value, data, attribute, segment.params);
  if (defaultMsg === null) {
    return null;
  }

  const custom =
    customMessages[`${attribute}.${segment.name}`] ?? customMessages[attribute];
  return custom ?? defaultMsg;
}

export class Validator<T extends Record<string, unknown>> implements ValidatorContract<T> {
  private bag: Record<string, string[]> = {};
  private passed = false;

  constructor(
    private readonly data: T,
    private readonly rules: Record<string, RuleDefinition>,
    private readonly messages: Record<string, string> = {},
  ) {}

  fails(): boolean {
    return Object.keys(this.bag).length > 0;
  }

  errors(): Record<string, string[]> {
    return { ...this.bag };
  }

  async validate(): Promise<void> {
    this.bag = {};
    this.passed = false;

    const data = this.data as Record<string, unknown>;

    for (const [attribute, def] of Object.entries(this.rules)) {
      const segments = normalizeRuleDefinition(def);
      const value = data[attribute];
      if (hasNullable(segments) && (value === null || value === undefined)) {
        continue;
      }

      for (const segment of segments) {
        const message = await runSegment(segment, attribute, value, data, this.messages);
        if (message) {
          appendError(this.bag, attribute, message);
        }
      }
    }

    if (this.fails()) {
      throw new ValidationException(this.bag);
    }
    this.passed = true;
  }

  validated(): T {
    if (!this.passed) {
      throw new Error("Call validate() successfully before validated().");
    }
    const out = {} as Record<string, unknown>;
    for (const key of Object.keys(this.rules)) {
      if (Object.prototype.hasOwnProperty.call(this.data, key)) {
        out[key] = this.data[key];
      }
    }
    return out as T;
  }
}
