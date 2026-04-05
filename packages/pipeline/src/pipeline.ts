import type { NextFn, PipeHandler, PipelineContract } from "./pipeline-contract.js";

/**
 * HTTP-agnostic pipeline (Illuminate\Pipeline-style composition).
 */
export class Pipeline<T> implements PipelineContract<T> {
  private pipes: PipeHandler<T>[] = [];

  constructor(private passable: T) {}

  through(...pipes: PipeHandler<T>[]): PipelineContract<T> {
    this.pipes.push(...pipes);
    return this;
  }

  async thenReturn(): Promise<T> {
    return this.then((p) => p);
  }

  async then<R>(destination: (payload: T) => R | Promise<R>): Promise<R> {
    let index = 0;
    const run: NextFn<T> = async (payload: T) => {
      if (index >= this.pipes.length) {
        return payload;
      }
      const pipe = this.pipes[index++]!;
      return pipe(payload, run);
    };
    const processed = await run(this.passable);
    return destination(processed);
  }
}

/**
 * Entry point: `pipeline(value).through(a, b).thenReturn()`.
 */
export function pipeline<T>(passable: T): Pipeline<T> {
  return new Pipeline(passable);
}
