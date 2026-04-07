import { describe, expect, it } from "vitest";
import { flushMicrotasks } from "@madda/testing";
import { FakeQueueDriver } from "./testing/index.js";

describe("@madda/queue/testing", () => {
  it("FakeQueueDriver + @madda/testing", async () => {
    const d = new FakeQueueDriver();
    await d.push("a");
    await flushMicrotasks();
    expect(d.pushed).toEqual(["a"]);
  });
});
