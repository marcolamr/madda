import { dataGet } from "./data-get.js";
import { ItemNotFoundException, MultipleItemsFoundException } from "./exceptions.js";

type KeySelector<T, K extends PropertyKey> = keyof T | ((item: T) => K);

function resolveKey<T, K extends PropertyKey>(
  item: T,
  key: KeySelector<T, K>,
): K {
  return (typeof key === "function" ? key(item) : (item as never)[key]) as K;
}

/**
 * Fluent, immutable list wrapper — same role as Laravel's
 * {@link https://laravel.com/docs/13.x/collections `Illuminate\Support\Collection`}.
 *
 * Stored as a dense array; use {@link Collection.groupBy} for keyed groups.
 */
export class Collection<T> {
  constructor(protected readonly items: readonly T[] = []) {}

  /** Create from varargs (Laravel `Collection::make`). */
  static make<U>(...items: U[]): Collection<U> {
    return new Collection(items);
  }

  /**
   * Wrap a single value, array, or existing collection.
   * Mirrors {@link https://laravel.com/docs/13.x/collections#method-wrap `Collection::wrap`}.
   */
  static wrap<U>(value: Collection<U>): Collection<U>;
  static wrap<U>(value: readonly U[]): Collection<U>;
  static wrap<U>(value: U): Collection<U>;
  static wrap<U>(value: U | readonly U[] | Collection<U>): Collection<U> {
    if (value instanceof Collection) {
      return value;
    }
    if (Array.isArray(value)) {
      return new Collection([...value] as U[]);
    }
    return new Collection([value as U]);
  }

  /** `Collection::times` — callback receives 1-based index (Laravel-compatible). */
  static times<U>(count: number, fn: (n: number) => U): Collection<U> {
    return new Collection(Array.from({ length: count }, (_, i) => fn(i + 1)));
  }

  /** Underlying values as a new array (Laravel `all`). */
  all(): T[] {
    return [...this.items];
  }

  get count(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  isNotEmpty(): boolean {
    return this.items.length > 0;
  }

  tap(fn: (c: this) => void): this {
    fn(this);
    return this;
  }

  pipe<R>(fn: (c: this) => R): R {
    return fn(this);
  }

  map<R>(fn: (item: T, index: number) => R): Collection<R> {
    return new Collection(this.items.map(fn));
  }

  flatMap<R>(fn: (item: T, index: number) => R | readonly R[]): Collection<R> {
    const out: R[] = [];
    this.items.forEach((item, i) => {
      const v = fn(item, i);
      if (Array.isArray(v)) {
        out.push(...v);
      } else {
        out.push(v as R);
      }
    });
    return new Collection(out);
  }

  filter(fn: (item: T, index: number) => boolean): Collection<T> {
    return new Collection(this.items.filter(fn));
  }

  reject(fn: (item: T, index: number) => boolean): Collection<T> {
    return new Collection(this.items.filter((item, i) => !fn(item, i)));
  }

  each(fn: (item: T, index: number) => void | false): this {
    for (let i = 0; i < this.items.length; i++) {
      if (fn(this.items[i]!, i) === false) {
        break;
      }
    }
    return this;
  }

  first(...args: [] | [predicate: (item: T, index: number) => boolean]): T | undefined {
    if (args.length === 0) {
      return this.items[0];
    }
    const [predicate] = args;
    const i = this.items.findIndex(predicate);
    return i === -1 ? undefined : this.items[i];
  }

  firstOrFail(
    predicate?: (item: T, index: number) => boolean,
  ): T {
    const found =
      predicate === undefined ? this.items[0] : this.items.find(predicate);
    if (found === undefined) {
      throw new ItemNotFoundException();
    }
    return found;
  }

  last(
    predicate?: (item: T, index: number) => boolean,
  ): T | undefined {
    if (predicate === undefined) {
      return this.items[this.items.length - 1];
    }
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i]!;
      if (predicate(item, i)) return item;
    }
    return undefined;
  }

  /** Exactly one match, or throws. */
  sole(predicate?: (item: T, index: number) => boolean): T {
    const pred = predicate ?? (() => true);
    const hits: T[] = [];
    this.items.forEach((item, i) => {
      if (pred(item, i)) hits.push(item);
    });
    if (hits.length === 0) throw new ItemNotFoundException();
    if (hits.length > 1) throw new MultipleItemsFoundException();
    return hits[0]!;
  }

  contains(value: T | ((item: T, index: number) => boolean)): boolean {
    if (typeof value === "function") {
      return this.items.some(value as (item: T, index: number) => boolean);
    }
    return this.items.some((x) => x === value);
  }

  push(...values: T[]): Collection<T> {
    return new Collection([...this.items, ...values]);
  }

  prepend(...values: T[]): Collection<T> {
    return new Collection([...values, ...this.items]);
  }

  merge(other: Iterable<T> | ArrayLike<T> | Collection<T>): Collection<T> {
    const rest =
      other instanceof Collection ? other.all() : Array.from(other);
    return new Collection([...this.items, ...rest]);
  }

  concat(other: Iterable<T> | ArrayLike<T> | Collection<T>): Collection<T> {
    return this.merge(other);
  }

  unique<K extends PropertyKey>(
    key?: KeySelector<T, K>,
  ): Collection<T> {
    if (key === undefined) {
      return new Collection(Array.from(new Set(this.items)));
    }
    const seen = new Set<K>();
    const out: T[] = [];
    for (const item of this.items) {
      const k = resolveKey(item, key);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
    return new Collection(out);
  }

  sort(compare?: (a: T, b: T) => number): Collection<T> {
    return new Collection([...this.items].sort(compare));
  }

  sortBy<K>(
    keyOrFn: keyof T | ((item: T) => K),
    compare?: (a: K, b: K) => number,
  ): Collection<T> {
    const cmp = compare ?? ((a: K, b: K) => (a < b ? -1 : a > b ? 1 : 0));
    const pairs = this.items.map((item) => {
      const k =
        typeof keyOrFn === "function"
          ? keyOrFn(item)
          : (item as T & object)[keyOrFn as keyof typeof item];
      return { item, k } as { item: T; k: K };
    });
    pairs.sort((a, b) => cmp(a.k, b.k));
    return new Collection(pairs.map((p) => p.item));
  }

  sortDesc(): Collection<T> {
    return new Collection(
      [...this.items].sort((a, b) => {
        if (a === b) return 0;
        return a < b ? 1 : -1;
      }),
    );
  }

  reverse(): Collection<T> {
    return new Collection([...this.items].reverse());
  }

  shuffle(): Collection<T> {
    const copy = [...this.items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j]!, copy[i]!];
    }
    return new Collection(copy);
  }

  values(): Collection<T> {
    return new Collection([...this.items]);
  }

  take(count: number): Collection<T> {
    if (count < 0) {
      return new Collection(this.items.slice(count));
    }
    return new Collection(this.items.slice(0, count));
  }

  skip(count: number): Collection<T> {
    return new Collection(this.items.slice(count));
  }

  slice(start: number, end?: number): Collection<T> {
    return new Collection(this.items.slice(start, end));
  }

  chunk(size: number): Collection<Collection<T>> {
    if (size < 1) {
      throw new Error("Chunk size must be at least 1.");
    }
    const chunks: Collection<T>[] = [];
    for (let i = 0; i < this.items.length; i += size) {
      chunks.push(new Collection(this.items.slice(i, i + size)));
    }
    return new Collection(chunks);
  }

  collapse<U>(this: Collection<U | readonly U[] | Collection<U>>): Collection<U> {
    const out: U[] = [];
    for (const item of this.items as readonly (U | readonly U[] | Collection<U>)[]) {
      if (item instanceof Collection) {
        out.push(...item.all());
      } else if (Array.isArray(item)) {
        out.push(...item);
      } else {
        out.push(item as U);
      }
    }
    return new Collection(out);
  }

  flatten(depth = Infinity): Collection<unknown> {
    const flat = (xs: readonly unknown[], d: number): unknown[] => {
      if (d <= 0) return [...xs];
      const acc: unknown[] = [];
      for (const x of xs) {
        if (x instanceof Collection) {
          acc.push(...flat(x.all(), d - 1));
        } else if (Array.isArray(x)) {
          acc.push(...flat(x, d - 1));
        } else {
          acc.push(x);
        }
      }
      return acc;
    };
    return new Collection(flat(this.items as unknown[], depth));
  }

  pluck(path: string): Collection<unknown> {
    return new Collection(this.items.map((item) => dataGet(item, path)));
  }

  /**
   * Index items by a key (last duplicate wins). Returns a `Map` so you can
   * `.get(id)`; wrap with `collect([...map.values()])` to keep chaining.
   */
  keyBy<K extends PropertyKey>(key: KeySelector<T, K>): Map<K, T> {
    const map = new Map<K, T>();
    for (const item of this.items) {
      map.set(resolveKey(item, key), item);
    }
    return map;
  }

  /**
   * Returns pairs `[groupKey, items]` so you can `map`, `filter`, etc.
   * (Laravel returns a keyed collection of collections; this stays typed for TS.)
   */
  groupBy<K extends PropertyKey>(
    key: KeySelector<T, K>,
  ): Collection<readonly [K, Collection<T>]> {
    const m = new Map<K, T[]>();
    for (const item of this.items) {
      const k = resolveKey(item, key);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(item);
    }
    return new Collection(
      Array.from(m.entries()).map(([k, v]) => [k, new Collection(v)] as const),
    );
  }

  where<K extends keyof T>(key: K, value: T[K]): Collection<T>;
  where<K extends keyof T>(
    key: K,
    operator: "!=" | "!==",
    value: T[K],
  ): Collection<T>;
  where<K extends keyof T>(
    key: K,
    operatorOrValue: T[K] | "!=" | "!==",
    maybeValue?: T[K],
  ): Collection<T> {
    if (operatorOrValue === "!=" || operatorOrValue === "!==") {
      return this.filter((item) => item[key] !== maybeValue);
    }
    return this.filter((item) => item[key] === operatorOrValue);
  }

  whereIn<K extends keyof T>(key: K, values: readonly T[K][]): Collection<T> {
    const set = new Set(values);
    return this.filter((item) => set.has(item[key]));
  }

  sum(key?: keyof T): number {
    if (key === undefined) {
      return this.items.reduce((a, b) => a + Number(b), 0);
    }
    return this.items.reduce((a, item) => a + Number(item[key]), 0);
  }

  avg(key?: keyof T): number | null {
    if (this.items.length === 0) return null;
    return this.sum(key) / this.items.length;
  }

  min(key?: keyof T): number | null {
    if (this.items.length === 0) return null;
    const nums = key === undefined
      ? this.items.map((x) => Number(x))
      : this.items.map((x) => Number(x[key]));
    return Math.min(...nums);
  }

  max(key?: keyof T): number | null {
    if (this.items.length === 0) return null;
    const nums = key === undefined
      ? this.items.map((x) => Number(x))
      : this.items.map((x) => Number(x[key]));
    return Math.max(...nums);
  }

  reduce<R>(fn: (carry: R, item: T, index: number) => R, initial: R): R {
    return this.items.reduce(fn, initial);
  }

  random(count?: number): T | Collection<T> {
    if (this.items.length === 0) {
      if (count === undefined) {
        throw new ItemNotFoundException("Cannot pick from an empty collection.");
      }
      return new Collection<T>([]);
    }
    if (count === undefined) {
      return this.items[Math.floor(Math.random() * this.items.length)]!;
    }
    const copy = this.shuffle().take(count);
    return copy;
  }

  toJson(): string {
    return JSON.stringify(this.items);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.items[Symbol.iterator]();
  }
}
