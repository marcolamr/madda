/**
 * Helpers de teste que **não** transitam para `@madda/events` (para `events`/`http`/`mail`
 * poderem usar este pacote em `devDependency` sem ciclo no grafo).
 *
 * - `FakeQueueDriver` → `@madda/queue/testing`
 * - `injectHttp` → `@madda/http/testing`
 * - `FakeMailTransport` → `@madda/mail/testing`
 * - `RecordingDispatcher` → `@madda/events`
 */
export { waitFor, flushMicrotasks } from "./async.js";
export { createInMemoryTestCache, ArrayCacheStore } from "./cache-test-double.js";
