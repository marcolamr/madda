/**
 * Validator for plain input objects (DTOs, CLI argv maps, message payloads — not domain entities).
 * See Illuminate\Validation: https://github.com/laravel/framework/tree/13.x/src/Illuminate/Validation
 */
export interface ValidatorContract<T extends Record<string, unknown> = Record<string, unknown>> {
  fails(): boolean;

  errors(): Record<string, string[]>;

  /**
   * Throws {@link import("./validation-exception.js").ValidationException} when validation fails.
   */
  validate(): Promise<void>;

  /**
   * Data after successful validation (same references; narrow with DTO type in application code).
   */
  validated(): T;
}
