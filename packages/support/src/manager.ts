/**
 * Multi-driver manager — same pattern as Laravel `Illuminate\Support\Manager`
 * (filesystem, mail, cache drivers, etc.).
 */
export abstract class Manager<TDriver = unknown> {
  private readonly drivers = new Map<string, TDriver>();

  driver(name?: string): TDriver {
    const n = name ?? this.getDefaultDriver();
    if (!this.drivers.has(n)) {
      this.drivers.set(n, this.createDriver(n));
    }
    return this.drivers.get(n)!;
  }

  protected abstract getDefaultDriver(): string;

  protected abstract createDriver(name: string): TDriver;

  /** Register a pre-built driver instance (Laravel `extend` / container binding). */
  extend(name: string, driver: TDriver): this {
    this.drivers.set(name, driver);
    return this;
  }

  protected purge(name?: string): void {
    if (name === undefined) {
      this.drivers.clear();
    } else {
      this.drivers.delete(name);
    }
  }
}
