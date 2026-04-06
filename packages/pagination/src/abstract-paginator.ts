import type { PaginationUrlOptions } from "./pagination-options.js";

/**
 * Shared link-building logic for offset paginators (Laravel {@link https://github.com/laravel/framework/tree/13.x/src/Illuminate/Pagination AbstractPaginator}).
 */
export abstract class AbstractPaginator<T> implements Iterable<T> {
  protected path: string;

  protected pageName: string;

  protected query: Record<string, string | undefined>;

  protected linkFragment: string | null;

  protected constructor(
    protected readonly pageSlice: T[],
    private readonly itemsPerPage: number,
    private readonly pageIndex: number,
    options: PaginationUrlOptions = {},
  ) {
    this.path = options.path ?? "";
    this.pageName = options.pageName ?? "page";
    this.query = { ...(options.query ?? {}) };
    this.linkFragment = options.fragment ?? null;
  }

  count(): number {
    return this.pageSlice.length;
  }

  items(): T[] {
    return [...this.pageSlice];
  }

  currentPage(): number {
    return this.pageIndex;
  }

  perPage(): number {
    return this.itemsPerPage;
  }

  /** @see https://laravel.com/docs/13.x/pagination#paginator-instance-methods */
  getPageName(): string {
    return this.pageName;
  }

  setPageName(name: string): this {
    this.pageName = name;
    return this;
  }

  withPath(path: string): this {
    this.path = path;
    return this;
  }

  appends(query: Record<string, string | undefined>): this {
    this.query = { ...this.query, ...query };
    return this;
  }

  fragment(name: string | null): this {
    this.linkFragment = name;
    return this;
  }

  url(page: number): string {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(this.query)) {
      if (v !== undefined && k !== this.pageName) {
        params.set(k, v);
      }
    }
    params.set(this.pageName, String(page));
    const qs = params.toString();
    const base = this.path.startsWith("/") ? this.path : `/${this.path}`;
    const hash = this.linkFragment ? `#${this.linkFragment}` : "";
    return `${base}${qs ? `?${qs}` : ""}${hash}`;
  }

  [Symbol.iterator](): Iterator<T> {
    return this.pageSlice.values();
  }
}
