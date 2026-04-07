import type { HttpContext } from "@madda/core";
import {
  Controller,
  createValidator,
  Get,
  pipeline,
  Post,
  RouteSchema,
  ValidationException,
} from "@madda/core";
import { echoActionRules, type EchoActionDto } from "../dto/echo-action.dto.js";
import { User } from "../models/user.js";

@Controller("api")
export class ApiController {
  @RouteSchema({
    query: {
      type: "object",
      properties: {
        page: { type: "integer", minimum: 1 },
      },
      additionalProperties: true,
    },
    responses: {
      "200": {
        type: "object",
        description: "Paginated users payload",
      },
    },
  })
  @Get("users")
  async users(ctx: HttpContext) {
    const page = Number(ctx.request.query.page ?? 1) || 1;
    const paginator = await User.paginate(5, page, {
      path: ctx.request.path,
      query: { ...ctx.request.query },
    });
    ctx.reply.status(200).json(paginator.toJSON((u) => u.toJSON()));
  }

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

  @RouteSchema({
    body: {
      type: "object",
      required: ["message"],
      properties: {
        message: { type: "string", minLength: 1 },
      },
    },
    responses: {
      "200": {
        type: "object",
        properties: {
          message: { type: "string" },
          receivedAt: { type: "number" },
          pipeline: { type: "boolean" },
        },
      },
    },
  })
  @Post("echo")
  async echo(ctx: HttpContext) {
    const rawInput = ctx.request.body as { message: string };

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
