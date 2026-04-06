/**
 * URL / query options when building pagination links (Laravel paginator options).
 * @see {@link https://laravel.com/docs/13.x/pagination#customizing-pagination-urls}
 */
export type PaginationUrlOptions = {
  /** Base path for generated links (e.g. `/api/users`). */
  path?: string;
  /** Query-string key for the current page (default `page`). */
  pageName?: string;
  /** Extra query parameters merged into every link (excluding the page key). */
  query?: Record<string, string | undefined>;
  /** Optional URL fragment (hash), without `#`. */
  fragment?: string | null;
};
