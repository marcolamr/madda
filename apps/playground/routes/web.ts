import { authUser, createAuthMiddlewareFromConfig } from "@madda/auth";
import { registerBroadcastingRoutes } from "@madda/broadcasting";
import type { HttpServer } from "@madda/core";
import { buildOpenApiDocument, HttpException, HttpRouter } from "@madda/core";
import { createSessionMiddlewareFromConfig } from "@madda/session";
import { PlaygroundDemoNotification } from "../app/notifications/playground-demo-notification.js";
import { app } from "../bootstrap/app.js";
import { getPlaygroundNotificationSender } from "../bootstrap/notifications.js";
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

    g.post("/demo/notification", async (ctx) => {
      const user = authUser(ctx);
      if (!user) {
        ctx.reply.status(401).json({ message: "Unauthenticated" });
        return;
      }
      const sender = await getPlaygroundNotificationSender();
      if (!sender) {
        ctx.reply.status(503).json({ message: "Notifications not configured" });
        return;
      }
      const body = (ctx.request.body ?? {}) as {
        message?: string;
        channels?: string[];
      };
      const message =
        typeof body.message === "string" && body.message.trim().length > 0
          ? body.message.trim()
          : "Hello from @madda/notifications";
      const channels =
        Array.isArray(body.channels) && body.channels.length > 0
          ? body.channels
          : (["database", "broadcast"] as const);
      const email = typeof user.email === "string" ? user.email : undefined;
      const notifiable = {
        notificationId: user.id,
        notificationEmail: email,
      };
      try {
        await sender.send(
          notifiable,
          new PlaygroundDemoNotification(message, channels),
        );
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        ctx.reply.status(400).json({ message: err });
        return;
      }
      ctx.reply.status(202).json({ ok: true, channels });
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
