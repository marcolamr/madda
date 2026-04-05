/**
 * Next step in the chain (Laravel {@link https://github.com/laravel/framework/blob/13.x/src/Illuminate/Pipeline/Pipeline.php Pipeline} `$next`).
 */
export type NextFn<T> = (payload: T) => T | Promise<T>;

/**
 * Composable stage: receives the passable and the next closure.
 */
export type PipeHandler<T> = (payload: T, next: NextFn<T>) => T | Promise<T>;

/**
 * Fluent pipeline over a single passable type (same object is threaded through).
 */
export interface PipelineContract<T> {
  through(...pipes: PipeHandler<T>[]): PipelineContract<T>;

  thenReturn(): Promise<T>;

  then<R>(destination: (payload: T) => R | Promise<R>): Promise<R>;
}
