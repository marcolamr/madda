import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { HttpServer } from "@madda/core";
import { registerPlayWebDev } from "@madda/play-web";

const here = dirname(fileURLToPath(import.meta.url));

export async function registerPlaygroundWeb(
  http: HttpServer,
  port: number,
): Promise<void> {
  const webRoot = resolve(here, "..", "web");
  await registerPlayWebDev(http, { webRoot, serverPort: port });
}
