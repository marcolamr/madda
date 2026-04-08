import { HttpKernel } from "@madda/core";
import { app } from "../bootstrap/app.js";
import { registerAppWeb } from "./register-app-web.js";

const port = Number(process.env.PORT ?? 3333);

const kernel = new HttpKernel(app, {}, {
  afterWeb: async (http) => {
    await registerAppWeb(http, port);
  },
});

await kernel.handle(port);
process.stdout.write(`HTTP + web listening on http://127.0.0.1:${port}\n`);
