/**
 * Snapshot of the query being built.
 * Passed to Grammar compile methods — Grammar never mutates it.
 */
export interface WhereClause {
  type: "basic" | "raw" | "null" | "notNull" | "in" | "between";
  column?: string;
  operator?: string;
  value?: unknown;
  /** Used by 'in' and 'between'. */
  values?: unknown[];
  boolean: "and" | "or";
  /** Used by 'raw'. */
  raw?: string;
}

export interface OrderClause {
  column: string;
  direction: "asc" | "desc";
}

export interface QueryState {
  table: string;
  columns: string[];
  wheres: WhereClause[];
  orders: OrderClause[];
  limitValue: number | null;
  offsetValue: number | null;
}

/**
 * Translates a {@link QueryState} into a SQL string + bindings tuple.
 *
 * Subclasses override individual `compile*` / `wrap*` methods to accommodate
 * driver-specific syntax without touching QueryBuilder or Connection.
 */
export class Grammar {
  compileSelect(state: QueryState): [sql: string, bindings: unknown[]] {
    const bindings: unknown[] = [];
    const columns =
      state.columns.length > 0 ? state.columns.map((c) => this.wrap(c)).join(", ") : "*";

    let sql = `select ${columns} from ${this.wrapTable(state.table)}`;

    if (state.wheres.length > 0) {
      const [where, whereBindings] = this.compileWheres(state.wheres);
      sql += ` where ${where}`;
      bindings.push(...whereBindings);
    }

    if (state.orders.length > 0) {
      sql += ` order by ${this.compileOrders(state.orders)}`;
    }

    if (state.limitValue !== null) {
      sql += ` limit ${state.limitValue}`;
    }

    if (state.offsetValue !== null) {
      sql += ` offset ${state.offsetValue}`;
    }

    return [sql, bindings];
  }

  compileInsert(
    table: string,
    values: Record<string, unknown>,
  ): [sql: string, bindings: unknown[]] {
    const columns = Object.keys(values)
      .map((c) => this.wrap(c))
      .join(", ");
    const placeholders = Object.keys(values)
      .map(() => "?")
      .join(", ");

    return [
      `insert into ${this.wrapTable(table)} (${columns}) values (${placeholders})`,
      Object.values(values),
    ];
  }

  compileUpdate(
    table: string,
    values: Record<string, unknown>,
    wheres: WhereClause[],
  ): [sql: string, bindings: unknown[]] {
    const set = Object.keys(values)
      .map((c) => `${this.wrap(c)} = ?`)
      .join(", ");
    const bindings: unknown[] = [...Object.values(values)];

    let sql = `update ${this.wrapTable(table)} set ${set}`;

    if (wheres.length > 0) {
      const [where, whereBindings] = this.compileWheres(wheres);
      sql += ` where ${where}`;
      bindings.push(...whereBindings);
    }

    return [sql, bindings];
  }

  compileDelete(
    table: string,
    wheres: WhereClause[],
  ): [sql: string, bindings: unknown[]] {
    const bindings: unknown[] = [];
    let sql = `delete from ${this.wrapTable(table)}`;

    if (wheres.length > 0) {
      const [where, whereBindings] = this.compileWheres(wheres);
      sql += ` where ${where}`;
      bindings.push(...whereBindings);
    }

    return [sql, bindings];
  }

  protected compileWheres(
    wheres: WhereClause[],
  ): [clause: string, bindings: unknown[]] {
    const parts: string[] = [];
    const bindings: unknown[] = [];

    for (const [i, where] of wheres.entries()) {
      const prefix = i === 0 ? "" : `${where.boolean} `;

      switch (where.type) {
        case "raw":
          parts.push(`${prefix}${where.raw!}`);
          break;

        case "null":
          parts.push(`${prefix}${this.wrap(where.column!)} is null`);
          break;

        case "notNull":
          parts.push(`${prefix}${this.wrap(where.column!)} is not null`);
          break;

        case "in": {
          const placeholders = where.values!.map(() => "?").join(", ");
          parts.push(
            `${prefix}${this.wrap(where.column!)} in (${placeholders})`,
          );
          bindings.push(...where.values!);
          break;
        }

        case "between":
          parts.push(
            `${prefix}${this.wrap(where.column!)} between ? and ?`,
          );
          bindings.push(where.values![0], where.values![1]);
          break;

        default:
          parts.push(
            `${prefix}${this.wrap(where.column!)} ${where.operator!} ?`,
          );
          bindings.push(where.value);
      }
    }

    return [parts.join(" "), bindings];
  }

  protected compileOrders(orders: OrderClause[]): string {
    return orders
      .map((o) => `${this.wrap(o.column)} ${o.direction}`)
      .join(", ");
  }

  protected wrapTable(table: string): string {
    return `"${table}"`;
  }

  protected wrap(column: string): string {
    if (column === "*") return "*";
    // pass-through expressions like 'count(*) as aggregate'
    if (column.includes("(") || column.includes(" ")) return column;
    return `"${column}"`;
  }
}
