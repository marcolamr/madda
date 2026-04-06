import { Str } from "./str.js";

/** Chainable string — Laravel `Stringable` built on `Str`. */
export class Stringable {
  constructor(private readonly inner: string) {}

  static of(value: unknown): Stringable {
    return new Stringable(value == null ? "" : String(value));
  }

  toString(): string {
    return this.inner;
  }

  value(): string {
    return this.inner;
  }

  isEmpty(): boolean {
    return this.inner === "";
  }

  isNotEmpty(): boolean {
    return this.inner !== "";
  }

  append(...values: string[]): Stringable {
    return new Stringable(this.inner + values.join(""));
  }

  prepend(...values: string[]): Stringable {
    return new Stringable(values.join("") + this.inner);
  }

  lower(): Stringable {
    return new Stringable(Str.lower(this.inner));
  }

  upper(): Stringable {
    return new Stringable(Str.upper(this.inner));
  }

  title(): Stringable {
    return new Stringable(Str.title(this.inner));
  }

  squish(): Stringable {
    return new Stringable(Str.squish(this.inner));
  }

  slug(separator = "-"): Stringable {
    return new Stringable(Str.slug(this.inner, separator));
  }

  snake(delimiter = "_"): Stringable {
    return new Stringable(Str.snake(this.inner, delimiter));
  }

  kebab(): Stringable {
    return new Stringable(Str.kebab(this.inner));
  }

  camel(): Stringable {
    return new Stringable(Str.camel(this.inner));
  }

  studly(): Stringable {
    return new Stringable(Str.studly(this.inner));
  }

  after(search: string): Stringable {
    return new Stringable(Str.after(this.inner, search));
  }

  before(search: string): Stringable {
    return new Stringable(Str.before(this.inner, search));
  }

  replace(search: string | RegExp, replace: string): Stringable {
    return new Stringable(Str.replace(search, replace, this.inner));
  }

  limit(limit = 100, end = "..."): Stringable {
    return new Stringable(Str.limit(this.inner, limit, end));
  }

  startsWith(needles: string | string[]): boolean {
    return Str.startsWith(this.inner, needles);
  }

  endsWith(needles: string | string[]): boolean {
    return Str.endsWith(this.inner, needles);
  }

  contains(needles: string | string[]): boolean {
    return Str.contains(this.inner, needles);
  }
}

export function str(value: unknown): Stringable {
  return Stringable.of(value);
}
