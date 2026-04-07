import { describe, expect, it } from "vitest";
import { createInMemoryTestCache, flushMicrotasks, waitFor } from "./index.js";

describe("@madda/testing", () => {
  it("createInMemoryTestCache", async () => {
    const c = createInMemoryTestCache();
    await c.set("k", 1);
    expect(await c.get("k")).toBe(1);
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
