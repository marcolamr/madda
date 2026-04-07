/**
 * Espera até `predicate` ser verdadeiro ou esgotar o tempo.
 * @throws Error se o tempo máximo for ultrapassado
 */
export async function waitFor(
  predicate: () => boolean | Promise<boolean>,
  options: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<void> {
  const timeoutMs = options.timeoutMs ?? 5_000;
  const intervalMs = options.intervalMs ?? 10;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await predicate()) {
      return;
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, intervalMs);
    });
  }
  throw new Error(`waitFor: condition not met within ${timeoutMs}ms`);
}

/** Liberta a fila de microtarefas uma vez. */
export async function flushMicrotasks(): Promise<void> {
  await Promise.resolve();
}
