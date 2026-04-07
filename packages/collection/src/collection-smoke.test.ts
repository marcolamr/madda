import { describe, expect, it } from "vitest";
import { waitFor } from "@madda/testing";
import { collect } from "./collect.js";

describe("@madda/collection", () => {
  it("collect counts", () => {
    expect(collect([1, 2, 3]).count).toBe(3);
  });

  it("uses @madda/testing waitFor", async () => {
    let ready = false;
    queueMicrotask(() => {
      ready = true;
    });
    await waitFor(() => ready, { timeoutMs: 2000, intervalMs: 1 });
    expect(ready).toBe(true);
  });
});
