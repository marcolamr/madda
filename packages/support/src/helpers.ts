/** Small global-style helpers — Laravel `tap`, `value`, `when`, `rescue`, etc. */

export function tap<T>(value: T, callback: (v: T) => void): T {
  callback(value);
  return value;
}

export function value<T>(v: T | (() => T)): T {
  return typeof v === "function" ? (v as () => T)() : v;
}

export function when<T, D = T>(
  condition: unknown,
  value: T | (() => T),
  defaultValue?: D | (() => D),
): T | D | undefined {
  if (condition) {
    return typeof value === "function" ? (value as () => T)() : value;
  }
  if (defaultValue === undefined) {
    return undefined;
  }
  return typeof defaultValue === "function" ? (defaultValue as () => D)() : defaultValue;
}

export function unless<T, D = T>(
  condition: unknown,
  value: T | (() => T),
  defaultValue?: D | (() => D),
): T | D | undefined {
  return when(!condition, value, defaultValue);
}

export function rescue<T>(
  callback: () => T,
  rescueValue: T | ((e: unknown) => T),
  report?: (e: unknown) => void,
): T {
  try {
    return callback();
  } catch (e) {
    report?.(e);
    return typeof rescueValue === "function" ? (rescueValue as (err: unknown) => T)(e) : rescueValue;
  }
}

export function throwIf(condition: unknown, error: Error | (() => Error)): void {
  if (condition) {
    throw typeof error === "function" ? error() : error;
  }
}

export function throwUnless(condition: unknown, error: Error | (() => Error)): void {
  throwIf(!condition, error);
}
