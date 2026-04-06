/**
 * Laravel `Conditionable` em TypeScript: executa callbacks condicionalmente e devolve
 * o resultado do callback ou a própria instância (`??` como no PHP).
 *
 * Usar nos builders (`Stringable`, `Fluent`, futuros request wrappers) sem magia global.
 */

export function whenInstance<T, R>(
  self: T,
  condition: unknown,
  callback: (self: T) => R,
  defaultCallback?: (self: T) => R,
): T | R {
  if (condition) {
    const r = callback(self);
    return (r ?? self) as T | R;
  }
  if (defaultCallback) {
    const r = defaultCallback(self);
    return (r ?? self) as T | R;
  }
  return self as T | R;
}

export function unlessInstance<T, R>(
  self: T,
  condition: unknown,
  callback: (self: T) => R,
  defaultCallback?: (self: T) => R,
): T | R {
  return whenInstance(self, !condition, callback, defaultCallback);
}
