import "./load-env-bootstrap.js";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Application } from "@madda/core";
import { createApplicationConfig } from "./config.js";

const bootstrapDir = dirname(fileURLToPath(import.meta.url));
const basePath = resolve(bootstrapDir, "..");

export const app = Application.configure({ basePath })
  .withConfig(createApplicationConfig())
  .withRouting({
    web: "routes/web.ts",
    commands: "routes/console.ts",
    health: "/up",
  })
  .withMiddleware(() => {})
  .withExceptions(() => {})
  .create();
