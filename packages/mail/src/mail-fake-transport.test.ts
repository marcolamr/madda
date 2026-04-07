import { describe, expect, it } from "vitest";
import { flushMicrotasks } from "@madda/testing";
import { Mailer } from "./mailer.js";
import { FakeMailTransport } from "./testing/index.js";

describe("@madda/mail", () => {
  it("FakeMailTransport + @madda/testing flushMicrotasks", async () => {
    const transport = new FakeMailTransport();
    const mailer = new Mailer(transport, { address: "app@example.test", name: "App" });
    await mailer.send({
      to: "user@example.test",
      subject: "Subject",
      text: "Body",
    });
    await flushMicrotasks();
    expect(transport.sent).toHaveLength(1);
    expect(transport.sent[0]?.subject).toBe("Subject");
  });
});
