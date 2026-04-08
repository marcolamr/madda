import type { HttpServer } from "@madda/core";
import { HttpRouter } from "@madda/core";

export default async function web(server: HttpServer): Promise<void> {
  const r = new HttpRouter(server);
  r.get("/", (ctx) => {
    ctx.reply.status(200).json({
      app: "{{APP_DISPLAY_NAME}}",
      slug: "{{APP_SLUG}}",
      message: "Madda API is running. Edit routes/web.ts.",
    });
  });
}
