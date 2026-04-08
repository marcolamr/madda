import { HttpKernel } from "@madda/core";
import { app } from "../bootstrap/app.js";

const port = Number(process.env.PORT ?? 3333);

const kernel = new HttpKernel(app, {});
await kernel.handle(port);
process.stdout.write(`HTTP server listening on http://127.0.0.1:${port}\n`);
