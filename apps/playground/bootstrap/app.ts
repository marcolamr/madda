import "./load-env-bootstrap.js";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  Application,
  HashManager,
  type HashingConfig,
} from "@madda/core";
import { createApplicationConfig } from "./config.js";
import { bootstrapDatabase } from "./database.js";
import { setHashManager } from "./hash-bridge.js";

const bootstrapDir = dirname(fileURLToPath(import.meta.url));
const basePath = resolve(bootstrapDir, "..");

const hashingPath = resolve(basePath, "config", "hashing.ts");
const hashingConfig: HashingConfig | undefined = existsSync(hashingPath)
  ? ((await import(pathToFileURL(hashingPath).href))
      .default as HashingConfig)
  : undefined;

export const app = Application.configure({ basePath })
  .withConfig(createApplicationConfig({ hashing: hashingConfig }))
  .withRouting({
    web: "routes/web.ts",
    commands: "routes/console.ts",
    health: "/up",
  })
  .withMiddleware(() => {
    // Register global HTTP middleware here
  })
  .withExceptions(() => {
    // Configure exception handling here
  })
  .create();

if (app.config?.has("hashing")) {
  setHashManager(
    HashManager.fromConfig(app.config.get<HashingConfig>("hashing")!),
  );
} else {
  setHashManager(undefined);
}

bootstrapDatabase(app);
