import type {
  LengthAwarePaginator,
  PaginationUrlOptions,
} from "@madda/pagination";
import type { ConnectionContract, RawRow } from "../connection/connection-contract.js";
import type { Grammar } from "../grammar/grammar.js";
import { QueryBuilder } from "../query/query-builder.js";

type Attributes = Record<string, unknown>;

/** Signature of the function that resolves [connection, grammar] for a model. */
export type ConnectionResolver = (
  connectionName?: string,
) => [ConnectionContract, Grammar];

/**
 * Polymorphic constructor type — accepts abstract classes so that
 * `typeof SomeModel` (which TypeScript considers abstract) satisfies this bound.
 * Internal code that needs to `new` it casts via `as any`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ModelCtor<T> = abstract new (...args: any[]) => T;

/**
 * Eloquent-style Active Record base.
 *
 * The model has **no SQL knowledge** — it delegates every persistence
 * operation to a {@link QueryBuilder}. SQL is compiled entirely inside
 * {@link Grammar}; the model only knows about attributes and the table name.
 *
 * @example
 * ```ts
 * class User extends Model {
 *   protected table = 'users';
 * }
 *
 * const user  = await User.find(1);
 * const users = await User.where('active', true).orderBy('name').get();
 * await User.create({ name: 'Jane', email: 'jane@example.com' });
 * ```
 */
export abstract class Model {
  // ------------------------------------------------------------------
  // Subclass configuration
  // ------------------------------------------------------------------

  /** Database table name. */
  protected table = "";

  /** Primary key column. */
  protected primaryKey = "id";

  /** Automatically manage `created_at` / `updated_at`. */
  protected timestamps = true;

  /**
   * Named connection to use. `undefined` means the manager's default.
   * Override per-model to route to a secondary database.
   */
  protected connectionName: string | undefined = undefined;

  // ------------------------------------------------------------------
  // Connection resolver (wired by DatabaseManager.bootModels())
  // ------------------------------------------------------------------

  private static _resolver: ConnectionResolver | null = null;

  static setResolver(resolver: ConnectionResolver): void {
    Model._resolver = resolver;
  }

  // ------------------------------------------------------------------
  // Instance state
  // ------------------------------------------------------------------

  private _attributes: Attributes = {};
  private _original: Attributes = {};
  private _exists = false;

  // ------------------------------------------------------------------
  // Static query entry points
  // ------------------------------------------------------------------

  /** Fluent query entry point (Laravel `Model::query()`). */
  static query<T extends Model>(this: ModelCtor<T>): QueryBuilder {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).newQuery() as QueryBuilder;
  }

  /**
   * Paginate all rows ordered by the model primary key (Laravel `Model::paginate`).
   * For filtered queries use `Model.query().…paginate(...)`.
   */
  static async paginate<T extends Model>(
    this: ModelCtor<T>,
    perPage: number,
    page = 1,
    options?: PaginationUrlOptions,
  ): Promise<LengthAwarePaginator<T>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctor = this as any;
    const qb = ctor.newQuery() as QueryBuilder;
    const inst = new ctor() as Model;
    const pk = (inst as unknown as { primaryKey: string }).primaryKey;
    qb.orderBy(pk);
    const raw = await qb.paginate(perPage, page, options);
    return raw.map((row) => hydrate(this, row as RawRow));
  }

  /** Return a fresh QueryBuilder bound to this model's table. */
  protected static newQuery<T extends Model>(this: ModelCtor<T>): QueryBuilder {
    if (!Model._resolver) {
      throw new Error(
        "No database resolver registered. Call DatabaseManager.bootModels() before querying.",
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (this as any)() as Model;
    const [connection, grammar] = Model._resolver(instance.connectionName);
    return new QueryBuilder(connection, grammar, instance.table);
  }

  /** Retrieve all rows as model instances. */
  static async all<T extends Model>(this: ModelCtor<T>): Promise<T[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (this as any).newQuery().get() as RawRow[];
    return rows.map((row) => hydrate(this, row));
  }

  /** Find a model by its primary key, or return `null`. */
  static async find<T extends Model>(
    this: ModelCtor<T>,
    id: number | string,
  ): Promise<T | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = await (this as any).newQuery().find(id) as RawRow | null;
    return row ? hydrate(this, row) : null;
  }

  /** Start a fluent where-chain on this model's table. */
  static where<T extends Model>(
    this: ModelCtor<T>,
    column: string,
    value: unknown,
  ): QueryBuilder;
  static where<T extends Model>(
    this: ModelCtor<T>,
    column: string,
    operator: string,
    value: unknown,
  ): QueryBuilder;
  static where<T extends Model>(
    this: ModelCtor<T>,
    column: string,
    operatorOrValue: unknown,
    value?: unknown,
  ): QueryBuilder {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const qb = (this as any).newQuery() as QueryBuilder;
    return value !== undefined
      ? qb.where(column, String(operatorOrValue), value)
      : qb.where(column, operatorOrValue);
  }

  /**
   * Create a new model instance, persist it, and return it.
   *
   * @example
   * ```ts
   * const user = await User.create({ name: 'Jane', email: 'jane@test.com' });
   * ```
   */
  static async create<T extends Model>(
    this: ModelCtor<T>,
    attributes: Attributes,
  ): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = new (this as any)() as T;
    (instance as unknown as Model).fill(attributes);
    await (instance as unknown as Model).save();
    return instance;
  }

  // ------------------------------------------------------------------
  // Instance operations
  // ------------------------------------------------------------------

  /** Bulk-assign attributes (no mass-assignment guard yet). */
  fill(attributes: Attributes): this {
    for (const [key, value] of Object.entries(attributes)) {
      this._attributes[key] = value;
    }
    return this;
  }

  getAttribute<T = unknown>(key: string): T {
    return this._attributes[key] as T;
  }

  setAttribute(key: string, value: unknown): this {
    this._attributes[key] = value;
    return this;
  }

  getAttributes(): Attributes {
    return { ...this._attributes };
  }

  /** `true` if any attribute differs from its last-synced value. */
  isDirty(): boolean {
    return Object.keys(this.getDirty()).length > 0;
  }

  getDirty(): Attributes {
    const dirty: Attributes = {};
    for (const [key, value] of Object.entries(this._attributes)) {
      if (this._original[key] !== value) dirty[key] = value;
    }
    return dirty;
  }

  /**
   * Persist the model — INSERT if new, UPDATE if it already exists.
   * Returns `true` on success.
   */
  async save(): Promise<boolean> {
    return this._exists ? this.performUpdate() : this.performInsert();
  }

  /** Remove the model from the database. */
  async delete(): Promise<boolean> {
    if (!this._exists) return false;

    const pk = this.getAttribute<number | string>(this.primaryKey);
    await this.newInstanceQuery().where(this.primaryKey, pk).delete();
    this._exists = false;
    return true;
  }

  /** Reload fresh attributes from the database. */
  async fresh(): Promise<this | null> {
    if (!this._exists) return null;
    const pk = this.getAttribute<number | string>(this.primaryKey);
    const row = await this.newInstanceQuery().find(pk);
    if (!row) return null;
    this._attributes = { ...row };
    this._original = { ...row };
    return this;
  }

  toJSON(): Attributes {
    return this.getAttributes();
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private newInstanceQuery(): QueryBuilder {
    if (!Model._resolver) {
      throw new Error("No database resolver registered.");
    }
    const [connection, grammar] = Model._resolver(this.connectionName);
    return new QueryBuilder(connection, grammar, this.table);
  }

  private async performInsert(): Promise<boolean> {
    const attrs = { ...this._attributes };

    if (this.timestamps) {
      const now = new Date().toISOString();
      attrs["created_at"] ??= now;
      attrs["updated_at"] ??= now;
    }

    const id = await this.newInstanceQuery().insert(attrs);

    this._attributes[this.primaryKey] = id;
    this._original = { ...this._attributes };
    this._exists = true;
    return true;
  }

  private async performUpdate(): Promise<boolean> {
    const dirty = this.getDirty();
    if (Object.keys(dirty).length === 0) return true;

    if (this.timestamps) {
      dirty["updated_at"] = new Date().toISOString();
      this._attributes["updated_at"] = dirty["updated_at"];
    }

    const pk = this.getAttribute<number | string>(this.primaryKey);
    await this.newInstanceQuery().where(this.primaryKey, pk).update(dirty);

    this._original = { ...this._attributes };
    return true;
  }
}

/**
 * Reconstruct a model from a raw database row (called after SELECT).
 * Uses `as any` to instantiate an abstract class via its concrete subclass.
 */
function hydrate<T extends Model>(ctor: ModelCtor<T>, row: RawRow): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const instance = new (ctor as any)() as T;
  const model = instance as unknown as {
    _attributes: Record<string, unknown>;
    _original: Record<string, unknown>;
    _exists: boolean;
  };

  model._attributes = { ...row };
  model._original = { ...row };
  model._exists = true;

  return instance;
}
