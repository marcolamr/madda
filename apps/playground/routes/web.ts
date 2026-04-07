import type { RouteRegistrar } from "@madda/core";
import { buildOpenApiDocument, HttpException, HttpRouter } from "@madda/core";
import { ApiController } from "../app/controllers/api-controller.js";
import { registerHttpControllers } from "../app/controllers/register.js";

export default function web(router: RouteRegistrar) {
  const r = new HttpRouter(router);

  registerHttpControllers(r);

  r.group({ prefix: "v1" }, (g) => {
    g.get("/openapi.json", (ctx) => {
      const doc = buildOpenApiDocument([ApiController], {
        info: {
          title: "Playground API (decorated controllers)",
          version: "0.0.0",
          description:
            "OpenAPI 3.1 gerado a partir de @RouteSchema nos controllers (contrato público).",
        },
      });
      ctx.reply.status(200).json(doc);
    });

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
