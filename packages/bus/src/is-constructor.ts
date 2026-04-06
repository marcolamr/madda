export function isConstructor(
  fn: unknown,
): fn is abstract new (...args: unknown[]) => unknown {
  return (
    typeof fn === "function" &&
    Object.prototype.hasOwnProperty.call(fn, "prototype") &&
    (fn as { prototype: { constructor?: unknown } }).prototype != null &&
    (fn as { prototype: { constructor: unknown } }).prototype.constructor === fn
  );
}
