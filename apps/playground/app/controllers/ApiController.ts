import type { HttpContext } from "@madda/core";
import { Controller, Get, Post } from "@madda/core";

@Controller("api")
export class ApiController {
  @Get("hello")
  hello(ctx: HttpContext) {
    const started = ctx.state.requestStartedAt as number | undefined;
    const ms =
      started !== undefined
        ? Math.round((performance.now() - started) * 100) / 100
        : null;
    ctx.reply.status(200).json({
      message: "from controller",
      ms,
    });
  }

  @Post("echo")
  echo(ctx: HttpContext) {
    ctx.reply.status(200).json({ ok: true });
  }
}
