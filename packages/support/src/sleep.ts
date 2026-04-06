/** Promise-based delay — Laravel `Sleep` facade (milliseconds). */
export class Sleep {
  static async for(ms: number): Promise<void> {
    await new Promise((r) => setTimeout(r, ms));
  }

  static async seconds(n: number): Promise<void> {
    await Sleep.for(n * 1000);
  }
}

export function sleep(ms: number): Promise<void> {
  return Sleep.for(ms);
}
