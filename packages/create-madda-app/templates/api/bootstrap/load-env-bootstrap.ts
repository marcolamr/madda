import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Import first in `app.ts` — before config reads `process.env`. */
config({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env"),
});
