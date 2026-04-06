/**
 * Nullable wrapper with chainable transforms — Laravel `Optional` / `optional()` helper.
 * When the inner value is null or undefined, further operations return empty Optional.
 */
export class Optional<T> {
  constructor(private readonly value: T | null | undefined) {}

  static of<T>(value: T | null | undefined): Optional<T> {
    return new Optional(value);
  }

  isPresent(): boolean {
    return this.value != null;
  }

  isEmpty(): boolean {
    return this.value == null;
  }

  get(): T | undefined {
    return this.value == null ? undefined : this.value;
  }

  getOrElse<U>(defaultValue: U): T | U {
    return this.value == null ? defaultValue : this.value;
  }

  map<U>(fn: (v: NonNullable<T>) => U): Optional<U> {
    if (this.value == null) {
      return new Optional<U>(undefined);
    }
    return new Optional(fn(this.value as NonNullable<T>));
  }

  flatMap<U>(fn: (v: NonNullable<T>) => Optional<U>): Optional<U> {
    if (this.value == null) {
      return new Optional<U>(undefined);
    }
    return fn(this.value as NonNullable<T>);
  }

  filter(predicate: (v: NonNullable<T>) => boolean): Optional<T> {
    if (this.value == null) {
      return this;
    }
    return predicate(this.value as NonNullable<T>)
      ? this
      : new Optional<T>(undefined);
  }

  tap(fn: (v: NonNullable<T>) => void): this {
    if (this.value != null) {
      fn(this.value as NonNullable<T>);
    }
    return this;
  }
}

/** Wrap a possibly-null value for fluent chaining. */
export function optional<T>(value: T | null | undefined): Optional<T> {
  return Optional.of(value);
}
