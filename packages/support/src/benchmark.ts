/** Measure execution time — Laravel `Benchmark`. */
export class Benchmark {
  static async measure<T>(callback: () => T | Promise<T>): Promise<{ result: T; ms: number }> {
    const t0 = performance.now();
    const result = await callback();
    return { result, ms: performance.now() - t0 };
  }

  static measureSync<T>(callback: () => T): { result: T; ms: number } {
    const t0 = performance.now();
    const result = callback();
    return { result, ms: performance.now() - t0 };
  }
}
