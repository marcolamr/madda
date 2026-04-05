import { app } from "../bootstrap/app.js";

const port = Number(process.env.PORT ?? 3333);

await app.listen(port);
process.stdout.write(`HTTP server listening on http://127.0.0.1:${port}\n`);
