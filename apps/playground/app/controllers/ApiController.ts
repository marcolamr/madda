import type { HttpContext } from "@madda/core";
import {
  Controller,
  createValidator,
  Get,
  pipeline,
  Post,
  ValidationException,
} from "@madda/core";
import { echoActionRules, type EchoActionDto } from "../dto/echo-action.dto.js";

@Controller("api")
export class ApiController {
  @Get("hello")
  async hello(ctx: HttpContext) {
    const started = ctx.state.requestStartedAt as number | undefined;
    const ms =
      started !== undefined
        ? Math.round((performance.now() - started) * 100) / 100
        : null;

    const piped = await pipeline({ stage: "start", ms })
      .through(async (payload, next) => next({ ...payload, stage: "piped" }))
      .thenReturn();

    ctx.reply.status(200).json({
      message: "from controller",
      ...piped,
    });
  }

  @Post("echo")
  async echo(ctx: HttpContext) {
    // In a real app, parse transport payload elsewhere (HTTP body, queue, CLI).
    const rawInput = { message: "demo from playground" };

    try {
      const validator = createValidator(rawInput, echoActionRules);
      await validator.validate();
      const dto = validator.validated() as EchoActionDto;

      type EchoPiped = EchoActionDto & {
        receivedAt: number;
        pipeline?: boolean;
      };

      const enriched = await pipeline<EchoPiped>({
        ...dto,
        receivedAt: Date.now(),
      })
        .through(async (payload, next) =>
          next({ ...payload, pipeline: true }),
        )
        .thenReturn();

      ctx.reply.status(200).json(enriched);
    } catch (error) {
      if (error instanceof ValidationException) {
        ctx.reply.status(422).json({
          message: "Validation failed",
          errors: error.errors,
        });
        return;
      }
      throw error;
    }
  }
}
