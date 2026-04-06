import type { Dispatcher } from "./dispatcher.js";

export type EventListenerModule = {
  registerEventListeners?: (dispatcher: Dispatcher) => void;
};

/**
 * Carrega módulos que exportam `registerEventListeners(dispatcher)` — descoberta opt-in
 * (a app passa imports dinâmicos ou paths resolvidos).
 */
export async function discoverEventListeners(
  dispatcher: Dispatcher,
  importers: Array<() => Promise<EventListenerModule>>,
): Promise<void> {
  for (const load of importers) {
    const mod = await load();
    mod.registerEventListeners?.(dispatcher);
  }
}
