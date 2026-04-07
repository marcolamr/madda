import { createAuthMiddlewareFromConfig } from "@madda/auth";
import { registerBroadcastingRoutes } from "@madda/broadcasting";
import type { HttpServer } from "@madda/core";
import { buildOpenApiDocument, HttpException, HttpRouter } from "@madda/core";
import { createSessionMiddlewareFromConfig } from "@madda/session";
import { app } from "../bootstrap/app.js";
import { playgroundBroadcastHub } from "../bootstrap/play-broadcast-hub.js";
import { ApiController } from "../app/controllers/api-controller.js";
import { AuthController } from "../app/controllers/auth-controller.js";
import { registerHttpControllers } from "../app/controllers/register.js";
import { playgroundUserProvider } from "../app/providers/playground-user-provider.js";

export default async function web(server: HttpServer): Promise<void> {
  const config = app.config;
  if (!config) {
    throw new Error("Application config is required for session/auth");
  }

  server.use(createSessionMiddlewareFromConfig(config));
  server.use(
    createAuthMiddlewareFromConfig(config, {
      userProvider: playgroundUserProvider,
      useSession: true,
      optional: true,
    }),
  );

  await registerBroadcastingRoutes(server, playgroundBroadcastHub);

  const r = new HttpRouter(server);
  registerHttpControllers(r);

  r.group({ prefix: "v1" }, (g) => {
    g.get("/openapi.json", (ctx) => {
      const doc = buildOpenApiDocument([ApiController, AuthController], {
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

    g.post("/demo/broadcast", (ctx) => {
      const body = (ctx.request.body ?? {}) as {
        channel?: string;
        event?: string;
        data?: unknown;
      };
      if (!body.channel || typeof body.channel !== "string") {
        ctx.reply.status(400).json({ message: "channel (string) is required" });
        return;
      }
      playgroundBroadcastHub.publish(
        body.channel,
        typeof body.event === "string" ? body.event : "demo",
        body.data ?? null,
      );
      ctx.reply.status(204).send();
    });

    g.group({ prefix: "demo" }, (g2) => {
      g2.get("/error", () => {
        throw new HttpException(418, "I'm a teapot", { hint: "demo" });
      });
    });
  });
}
