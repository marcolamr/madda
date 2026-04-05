/**
 * Custom rule object (Laravel invokable / Rule object style).
 * Keep transport-agnostic: no Request/Response.
 */
export interface ValidationRuleContract {
  /**
   * Return `null` when valid, or a single user-facing message when invalid.
   */
  validate(
    attribute: string,
    value: unknown,
    data: Record<string, unknown>,
  ): string | null | Promise<string | null>;
}
