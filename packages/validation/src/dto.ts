/**
 * **DTO** = shape of validated *input* (HTTP body, queue message, CLI flags).
 * **Entity** = domain object with invariants, often loaded from DB — validate separately (domain layer).
 *
 * Use `const dto = validator.validated() as MyDto` or this alias to document intent only.
 */
export type DataTransferObject<T extends Record<string, unknown>> = T;
