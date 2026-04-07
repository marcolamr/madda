import { attemptSessionLogin, authUser, sessionLogout } from "@madda/auth";
import type { HttpContext } from "@madda/core";
import {
  Controller,
  Get,
  HttpException,
  Post,
  RouteSchema,
} from "@madda/core";
import { trySessionFromContext } from "@madda/session";
import { getHashManagerOrThrow } from "../../bootstrap/hash-bridge.js";
import { User } from "../models/user.js";

@Controller("v1/auth")
export class AuthController {
  @RouteSchema({
    body: {
      type: "object",
      required: ["email", "password"],
      properties: {
        email: { type: "string", minLength: 3 },
        password: { type: "string", minLength: 1 },
      },
    },
    responses: {
      "200": {
        type: "object",
        properties: {
          ok: { type: "boolean" },
          user: { type: "object" },
        },
      },
    },
  })
  @Post("login")
  async login(ctx: HttpContext) {
    const body = ctx.request.body as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";
    if (!email) {
      throw new HttpException(422, "Validation failed", { message: "email required" });
    }

    const row = await User.where("email", email).first();
    if (!row) {
      throw new HttpException(401, "Invalid credentials", {
        message: "Invalid credentials",
      });
    }

    const model = await User.find(row.id as number | string);
    if (!model) {
      throw new HttpException(401, "Invalid credentials", {
        message: "Invalid credentials",
      });
    }

    const session = trySessionFromContext(ctx);
    if (!session) {
      throw new HttpException(500, "Session unavailable", {
        message: "Session middleware missing",
      });
    }

    const hash = model.getAttribute<string>("password");
    const ok = await attemptSessionLogin(
      session,
      String(model.getAttribute<number | string>("id")),
      password,
      hash,
      getHashManagerOrThrow(),
    );

    if (!ok) {
      throw new HttpException(401, "Invalid credentials", {
        message: "Invalid credentials",
      });
    }

    ctx.reply.status(200).json({
      ok: true,
      user: model.toJSON(),
    });
  }

  @Post("logout")
  async logout(ctx: HttpContext) {
    const session = trySessionFromContext(ctx);
    if (session) {
      sessionLogout(session);
    }
    ctx.reply.status(204).send();
  }

  @Get("me")
  async me(ctx: HttpContext) {
    const user = authUser(ctx);
    ctx.reply.status(200).json({
      user: user ?? null,
    });
  }
}
