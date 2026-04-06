import {
  LengthAwarePaginator,
  type PaginationUrlOptions,
} from "@madda/pagination";
import type { ConnectionContract, RawRow } from "../connection/connection-contract.js";
import type { Grammar, OrderClause, QueryState, WhereClause } from "../grammar/grammar.js";
import type { QueryBuilderContract } from "./query-builder-contract.js";

/**
 * Fluent SQL query builder.
 *
 * Accumulates query state (table, wheres, orders, …) and delegates SQL
 * compilation entirely to a {@link Grammar} instance. The builder never
 * writes a SQL string itself — low coupling is the point.
 *
 * @example
 * ```ts
 * const users = await db
 *   .table('users')
 *   .where('active', true)
 *   .orderBy('name')
 *   .limit(25)
 *   .get();
 * ```
 */
export class QueryBuilder implements QueryBuilderContract {
  private state: QueryState;

  constructor(
    private readonly connection: ConnectionContract,
    private readonly grammar: Grammar,
    table: string,
  ) {
    this.state = {
      table,
      columns: [],
      wheres: [],
      orders: [],
      limitValue: null,
      offsetValue: null,
    };
  }

  // -------------------------------------------------------------------------
  // Column selection
  // -------------------------------------------------------------------------

  select(...columns: string[]): this {
    this.state.columns = columns;
    return this;
  }

  // -------------------------------------------------------------------------
  // Where constraints
  // -------------------------------------------------------------------------

  where(column: string, operatorOrValue: unknown, value?: unknown): this {
    return this.addWhere(column, operatorOrValue, value, "and");
  }

  orWhere(column: string, operatorOrValue: unknown, value?: unknown): this {
    return this.addWhere(column, operatorOrValue, value, "or");
  }

  whereNull(column: string): this {
    this.state.wheres.push({ type: "null", column, boolean: "and" });
    return this;
  }

  whereNotNull(column: string): this {
    this.state.wheres.push({ type: "notNull", column, boolean: "and" });
    return this;
  }

  whereIn(column: string, values: unknown[]): this {
    this.state.wheres.push({ type: "in", column, values, boolean: "and" });
    return this;
  }

  whereBetween(column: string, values: [unknown, unknown]): this {
    this.state.wheres.push({ type: "between", column, values, boolean: "and" });
    return this;
  }

  whereRaw(sql: string): this {
    this.state.wheres.push({ type: "raw", raw: sql, boolean: "and" });
    return this;
  }

  // -------------------------------------------------------------------------
  // Ordering & pagination
  // -------------------------------------------------------------------------

  orderBy(column: string, direction: "asc" | "desc" = "asc"): this {
    this.state.orders.push({ column, direction } as OrderClause);
    return this;
  }

  orderByDesc(column: string): this {
    return this.orderBy(column, "desc");
  }

  limit(value: number): this {
    this.state.limitValue = value;
    return this;
  }

  offset(value: number): this {
    this.state.offsetValue = value;
    return this;
  }

  // -------------------------------------------------------------------------
  // Terminal methods
  // -------------------------------------------------------------------------

  get(): Promise<RawRow[]> {
    const [sql, bindings] = this.grammar.compileSelect(this.state);
    return this.connection.select(sql, bindings);
  }

  async first(): Promise<RawRow | null> {
    const rows = await this.limit(1).get();
    return rows[0] ?? null;
  }

  find(id: number | string): Promise<RawRow | null> {
    return this.where("id", id).first();
  }

  async insert(values: Record<string, unknown>): Promise<number | bigint> {
    const [sql, bindings] = this.grammar.compileInsert(this.state.table, values);
    const result = await this.connection.statement(sql, bindings);
    return result.lastInsertRowid;
  }

  async update(values: Record<string, unknown>): Promise<number> {
    const [sql, bindings] = this.grammar.compileUpdate(
      this.state.table,
      values,
      this.state.wheres,
    );
    const result = await this.connection.statement(sql, bindings);
    return result.changes;
  }

  async delete(): Promise<number> {
    const [sql, bindings] = this.grammar.compileDelete(
      this.state.table,
      this.state.wheres,
    );
    const result = await this.connection.statement(sql, bindings);
    return result.changes;
  }

  async count(): Promise<number> {
    const savedColumns = this.state.columns;
    this.state.columns = ["count(*) as aggregate"];

    const [sql, bindings] = this.grammar.compileSelect(this.state);
    this.state.columns = savedColumns;

    const rows = await this.connection.select(sql, bindings);
    return Number(rows[0]?.aggregate ?? 0);
  }

  clone(): this {
    const next = new QueryBuilder(
      this.connection,
      this.grammar,
      this.state.table,
    ) as this;
    next.copyStateFrom(this);
    return next;
  }

  async paginate(
    perPage: number,
    page = 1,
    options?: PaginationUrlOptions,
  ): Promise<LengthAwarePaginator<RawRow>> {
    const per = Math.max(1, Math.floor(perPage) || 1);
    const currentPage = Math.max(1, Math.floor(page) || 1);
    const total = await this.clone().count();
    const rows = await this.clone()
      .limit(per)
      .offset((currentPage - 1) * per)
      .get();
    return new LengthAwarePaginator(rows, total, per, currentPage, options);
  }

  // -------------------------------------------------------------------------
  // Internal helpers
  // -------------------------------------------------------------------------

  private copyStateFrom(other: QueryBuilder): void {
    this.state = structuredClone(other.state);
  }

  private addWhere(
    column: string,
    operatorOrValue: unknown,
    value: unknown,
    boolean: "and" | "or",
  ): this {
    const clause: WhereClause =
      value === undefined
        ? { type: "basic", column, operator: "=", value: operatorOrValue, boolean }
        : { type: "basic", column, operator: String(operatorOrValue), value, boolean };

    this.state.wheres.push(clause);
    return this;
  }
}
