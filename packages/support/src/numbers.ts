/**
 * Locale-aware formatting — mirrors Laravel `Illuminate\Support\Number`
 * without shadowing the global `Number` constructor.
 */
export class Numbers {
  static format(n: number, locale?: string, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, options).format(n);
  }

  static currency(
    n: number,
    currency = "USD",
    locale?: string,
    options?: Omit<Intl.NumberFormatOptions, "style" | "currency">,
  ): string {
    return new Intl.NumberFormat(locale, { style: "currency", currency, ...options }).format(n);
  }

  static percentage(n: number, locale?: string, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(locale, { style: "percent", ...options }).format(n);
  }

  static fileSize(bytes: number, locale?: string, binary = false): string {
    const base = binary ? 1024 : 1000;
    const units = binary
      ? ["B", "KiB", "MiB", "GiB", "TiB"]
      : ["B", "KB", "MB", "GB", "TB"];
    let v = Math.abs(bytes);
    let u = 0;
    while (v >= base && u < units.length - 1) {
      v /= base;
      u += 1;
    }
    const formatted = Numbers.format(v, locale, { maximumFractionDigits: 2 });
    return `${bytes < 0 ? "-" : ""}${formatted} ${units[u]}`;
  }
}
