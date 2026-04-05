import type { RouteRegistrar } from "@madda/core";

export default function web(router: RouteRegistrar) {
  router.get("/", (ctx) => {
    ctx.reply.status(200).send("Madda playground");
  });
}
