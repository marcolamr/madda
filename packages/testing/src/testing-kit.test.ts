import { describe, expect, it } from "vitest";
import { createHttpServer } from "@madda/http";
import { Mailer } from "@madda/mail";
import {
  createInMemoryTestCache,
  FakeMailTransport,
  FakeQueueDriver,
  flushMicrotasks,
  injectHttp,
  RecordingDispatcher,
  waitFor,
} from "./index.js";

describe("@madda/testing", () => {
  it("FakeMailTransport + Mailer", async () => {
    const transport = new FakeMailTransport();
    const mailer = new Mailer(transport, { address: "app@example.test", name: "App" });
    await mailer.send({
      to: "u@example.test",
      subject: "Hi",
      text: "Body",
    });
    expect(transport.sent).toHaveLength(1);
    expect(transport.sent[0]?.subject).toBe("Hi");
  });

  it("FakeQueueDriver", async () => {
    const d = new FakeQueueDriver();
    await d.push('{"v":1}');
    expect(d.pushed).toEqual(['{"v":1}']);
  });

  it("RecordingDispatcher", () => {
    const d = new RecordingDispatcher();
    let heard = "";
    d.listen("x", (p) => {
      heard = String(p);
    });
    d.emit("x", "a");
    expect(heard).toBe("a");
    expect(d.records).toEqual([{ kind: "string", name: "x", payload: "a" }]);
  });

  it("createInMemoryTestCache", async () => {
    const c = createInMemoryTestCache();
    await c.set("k", 1);
    expect(await c.get("k")).toBe(1);
  });

  it("injectHttp", async () => {
    const server = createHttpServer({ logger: false, requestAccessLog: false });
    server.get("/t", (ctx) => {
      ctx.reply.status(200).json({ ok: true });
    });
    const res = await injectHttp(server, { method: "GET", url: "/t" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual({ ok: true });
    await server.close();
  });

  it("flushMicrotasks", async () => {
    let n = 0;
    queueMicrotask(() => {
      n = 1;
    });
    expect(n).toBe(0);
    await flushMicrotasks();
    expect(n).toBe(1);
  });

  it("waitFor", async () => {
    let ready = false;
    queueMicrotask(() => {
      ready = true;
    });
    await waitFor(() => ready, { timeoutMs: 1000, intervalMs: 1 });
    expect(ready).toBe(true);
  });
});
