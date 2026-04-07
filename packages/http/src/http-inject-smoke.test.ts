import { describe, expect, it } from "vitest";
import { flushMicrotasks } from "@madda/testing";
import { createHttpServer } from "./factory.js";
import { injectHttp } from "./testing/inject-http.js";

describe("@madda/http", () => {
  it("injectHttp + @madda/testing flushMicrotasks", async () => {
    const server = createHttpServer({ logger: false, requestAccessLog: false });
    server.get("/x", (ctx) => {
      ctx.reply.status(200).json({ ok: 1 });
    });
    const res = await injectHttp(server, { method: "GET", url: "/x" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: 1 });
    await flushMicrotasks();
    await server.close();
  });
});
