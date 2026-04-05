import type { HttpServer } from "./server.js";

export interface HttpDriverContract {
  createServer(): HttpServer;
}
