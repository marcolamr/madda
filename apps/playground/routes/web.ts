import type { RouteRegistrar } from "@madda/core";
import { HttpException, HttpRouter } from "@madda/core";
import { registerHttpControllers } from "../app/controllers/register.js";

export default function web(router: RouteRegistrar) {
  const r = new HttpRouter(router);

  registerHttpControllers(r);

  r.get("/", (ctx) => {
    ctx.reply.status(200).send("Madda playground");
  });

  r.group({ prefix: "v1" }, (g) => {
    g.get("/ping", (ctx) => {
      ctx.reply.status(200).json({ pong: true });
    });

    g.group({ prefix: "demo" }, (g2) => {
      g2.get("/error", () => {
        throw new HttpException(418, "I'm a teapot", { hint: "demo" });
      });
    });
  });
}
