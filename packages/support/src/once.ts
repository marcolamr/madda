/** Memoize by string key — practical stand-in for Laravel `Once` (stack-based in PHP). */
const store = new Map<string, unknown>();

export class Once {
  static run<T>(key: string, callback: () => T): T {
    if (store.has(key)) {
      return store.get(key) as T;
    }
    const v = callback();
    store.set(key, v);
    return v;
  }

  static forget(key: string): void {
    store.delete(key);
  }

  static flush(): void {
    store.clear();
  }
}
