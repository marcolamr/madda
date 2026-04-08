/** @import { type ValidatorContract } from "./validator-contract.js" */

/**
 * Thrown when {@link ValidatorContract.validate} fails.
 * No HTTP semantics — map to 422 in your transport layer if needed.
 */
export class ValidationException extends Error {
  readonly errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    super("Validation failed");
    this.name = "ValidationException";
    this.errors = errors;
  }
}
