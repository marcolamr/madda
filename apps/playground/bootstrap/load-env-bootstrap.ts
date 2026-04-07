import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Deve ser o primeiro import de `app.ts` — antes de `./config.js` ler `process.env`. */
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env"),
});
