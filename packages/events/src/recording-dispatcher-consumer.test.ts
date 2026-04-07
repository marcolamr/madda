import { describe, expect, it } from "vitest";
import { waitFor } from "@madda/testing";
import { RecordingDispatcher } from "./recording-dispatcher.js";

describe("@madda/events", () => {
  it("RecordingDispatcher + @madda/testing waitFor", async () => {
    const d = new RecordingDispatcher();
    let last: unknown;
    d.listen("demo", (p) => {
      last = p;
    });
    queueMicrotask(() => {
      d.emit("demo", { n: 1 });
    });
    await waitFor(() => last !== undefined, { timeoutMs: 2000, intervalMs: 1 });
    expect(last).toEqual({ n: 1 });
    expect(d.records).toEqual([{ kind: "string", name: "demo", payload: { n: 1 } }]);
  });
});
