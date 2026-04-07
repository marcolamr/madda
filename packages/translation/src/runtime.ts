/**
 * Entrada **sem** `node:fs` — usar no browser / Vite client.
 * O ponto principal `@madda/translation` inclui `loadLocaleMessages` e não deve ser importado no bundle client.
 */
export { formatMessage, lookupTranslation } from "./format.js";
