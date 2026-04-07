import { describe, expect, it } from "vitest";
import { flushMicrotasks } from "@madda/testing";
import { Stringable } from "./stringable.js";

describe("@madda/support", () => {
  it("Stringable chains", () => {
    expect(Stringable.of("a").append("b").toString()).toBe("ab");
  });

  it("uses @madda/testing flushMicrotasks", async () => {
    let n = 0;
    queueMicrotask(() => {
      n = 1;
    });
    await flushMicrotasks();
    expect(n).toBe(1);
  });
});
