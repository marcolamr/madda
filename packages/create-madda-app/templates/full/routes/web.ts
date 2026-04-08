import type { HttpServer } from "@madda/core";
import { HttpRouter } from "@madda/core";

export default async function web(server: HttpServer): Promise<void> {
  const r = new HttpRouter(server);
  r.get("/v1/ping", (ctx) => {
    ctx.reply.status(200).json({ pong: true });
  });
}
