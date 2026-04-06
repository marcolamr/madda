import { HttpKernel } from "@madda/core";
import { app } from "../bootstrap/app.js";

const kernel = new HttpKernel(app);
const port = Number(process.env.PORT ?? 3333);

await kernel.handle(port);
process.stdout.write(`HTTP server listening on http://127.0.0.1:${port}\n`);
