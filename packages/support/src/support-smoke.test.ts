import { describe, expect, it } from "vitest";
import { Stringable } from "./stringable.js";

describe("@madda/support", () => {
  it("Stringable chains", () => {
    expect(Stringable.of("a").append("b").toString()).toBe("ab");
  });
});
