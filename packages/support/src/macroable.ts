/**
 * Registo de métodos em runtime — ideia do Laravel `Macroable`.
 * Tipagem forte no registo (`this` conhecido); chamadas dinâmicas permanecem em `unknown`
 * se o consumidor não declarar um módulo de extensão.
 */

type AnyCtor = abstract new (...args: never[]) => object;
type MacroFn = (this: object, ...args: unknown[]) => unknown;

const registry = new WeakMap<AnyCtor, Map<string, MacroFn>>();
const macroKeys = new WeakMap<AnyCtor, Set<string>>();

function getMap(ctor: AnyCtor): Map<string, MacroFn> {
  let m = registry.get(ctor);
  if (!m) {
    m = new Map();
    registry.set(ctor, m);
  }
  return m;
}

function trackKey(ctor: AnyCtor, name: string): void {
  let s = macroKeys.get(ctor);
  if (!s) {
    s = new Set();
    macroKeys.set(ctor, s);
  }
  s.add(name);
}

function defineProto(ctor: AnyCtor, name: string): void {
  Object.defineProperty(ctor.prototype, name, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: function macroDispatch(this: object, ...args: unknown[]) {
      const fn = registry.get(ctor)?.get(name);
      if (!fn) {
        throw new Error(`Macro "${String(name)}" is not registered on ${ctor.name}`);
      }
      return fn.apply(this, args);
    },
  });
}

/** Regista um método de instância em `ctor.prototype[name]`. */
export function registerMacro<C extends AnyCtor>(
  ctor: C,
  name: string,
  fn: (this: InstanceType<C>, ...args: unknown[]) => unknown,
): void {
  const map = getMap(ctor);
  if (map.has(name)) {
    map.set(name, fn as MacroFn);
    return;
  }
  if (name in ctor.prototype) {
    throw new Error(
      `Cannot register macro "${String(name)}": a member with that name already exists on ${ctor.name}`,
    );
  }
  map.set(name, fn as MacroFn);
  trackKey(ctor, name);
  defineProto(ctor, name);
}

export function hasMacro(ctor: AnyCtor, name: string): boolean {
  return registry.get(ctor)?.has(name) ?? false;
}

/** Remove só propriedades registadas como macro (útil em testes). */
export function flushMacros(ctor: AnyCtor): void {
  const keys = macroKeys.get(ctor);
  const map = registry.get(ctor);
  if (keys) {
    for (const name of keys) {
      delete (ctor.prototype as Record<string, unknown>)[name];
    }
    keys.clear();
  }
  map?.clear();
}
