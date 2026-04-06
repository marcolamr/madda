import { AbstractPaginator } from "./abstract-paginator.js";
import type { PaginationUrlOptions } from "./pagination-options.js";

/**
 * Laravel {@link https://github.com/laravel/framework/blob/13.x/src/Illuminate/Pagination/LengthAwarePaginator.php LengthAwarePaginator}
 * — offset pagination with total count (full page numbers / meta).
 */
export class LengthAwarePaginator<T> extends AbstractPaginator<T> {
  constructor(
    items: T[],
    private readonly totalCount: number,
    perPage: number,
    currentPage: number,
    options: PaginationUrlOptions = {},
  ) {
    super(items, perPage, currentPage, options);
  }

  total(): number {
    return this.totalCount;
  }

  lastPage(): number {
    const per = this.perPage();
    if (per <= 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(this.totalCount / per));
  }

  hasMorePages(): boolean {
    return this.currentPage() < this.lastPage();
  }

  onFirstPage(): boolean {
    return this.currentPage() <= 1;
  }

  onLastPage(): boolean {
    return this.currentPage() >= this.lastPage();
  }

  firstItem(): number | null {
    if (this.totalCount === 0 || this.count() === 0) {
      return null;
    }
    return (this.currentPage() - 1) * this.perPage() + 1;
  }

  lastItem(): number | null {
    if (this.totalCount === 0 || this.count() === 0) {
      return null;
    }
    return (this.currentPage() - 1) * this.perPage() + this.count();
  }

  hasPages(): boolean {
    return this.lastPage() > 1;
  }

  nextPageUrl(): string | null {
    if (!this.hasMorePages()) {
      return null;
    }
    return this.url(this.currentPage() + 1);
  }

  previousPageUrl(): string | null {
    if (this.onFirstPage()) {
      return null;
    }
    return this.url(this.currentPage() - 1);
  }

  /**
   * Map items while preserving pagination metadata (Laravel `through`-style).
   */
  map<U>(mapper: (item: T, index: number) => U): LengthAwarePaginator<U> {
    const mapped = this.pageSlice.map((item, index) => mapper(item, index));
    return new LengthAwarePaginator(
      mapped,
      this.totalCount,
      this.perPage(),
      this.currentPage(),
      {
        path: this.path,
        pageName: this.pageName,
        query: { ...this.query },
        fragment: this.linkFragment,
      },
    );
  }

  /**
   * JSON shape aligned with Laravel’s paginator resource output
   * {@link https://laravel.com/docs/13.x/pagination#converting-results-to-json}.
   */
  toJSON(serializeItem: (item: T) => unknown = (item) => item as unknown): Record<string, unknown> {
    const last = this.lastPage();
    const currentPageUrl = this.url(this.currentPage());
    return {
      total: this.totalCount,
      per_page: this.perPage(),
      current_page: this.currentPage(),
      last_page: last,
      current_page_url: currentPageUrl,
      first_page_url: this.url(1),
      last_page_url: this.url(last),
      next_page_url: this.nextPageUrl(),
      prev_page_url: this.previousPageUrl(),
      path: this.path,
      from: this.firstItem(),
      to: this.lastItem(),
      data: this.pageSlice.map(serializeItem),
    };
  }
}
