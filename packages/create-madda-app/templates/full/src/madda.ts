import { ConsoleKernel } from "@madda/console";
import { app } from "../bootstrap/app.js";

const kernel = new ConsoleKernel(app);
const status = await kernel.handle(process.argv);
process.exit(status);
