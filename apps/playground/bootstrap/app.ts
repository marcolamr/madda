import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Application } from "@madda/core";

const bootstrapDir = dirname(fileURLToPath(import.meta.url));

/**
 * Same idea as Laravel's `Application::configure(dirname(__DIR__))`:
 * base path is the application root (parent of `bootstrap/`).
 */
const basePath = resolve(bootstrapDir, "..");

export const app = Application.configure({
  basePath,
})
  .withRouting({
    // Like `__DIR__.'/../routes/web.php'` from bootstrap — paths are relative to `basePath`.
    web: "routes/web.ts",
    commands: "routes/console.ts",
    health: "/up",
  })
  .withMiddleware(() => {
    //
  })
  .withExceptions(() => {
    //
  })
  .create();
