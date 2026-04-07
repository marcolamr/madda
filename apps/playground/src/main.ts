import { HttpKernel } from "@madda/core";
import { app } from "../bootstrap/app.js";
import { registerPlaygroundWeb } from "./register-playground-web.js";

const port = Number(process.env.PORT ?? 3333);

const kernel = new HttpKernel(
  app,
  {},
  process.env.PLAYGROUND_WEB === "0"
    ? undefined
    : {
        afterWeb: async (http) => {
          await registerPlaygroundWeb(http, port);
        },
      },
);

await kernel.handle(port);
process.stdout.write(`HTTP server listening on http://127.0.0.1:${port}\n`);
