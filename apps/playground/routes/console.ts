import { Madda } from "@madda/console";

Madda.command("inspire", function () {
  this.line("Keep it simple, keep it clean.");
}).describe("Display an inspiring quote");

Madda.command("greet {name} {--upper}", function () {
  const name = this.argument("name") as string;
  const message = `Hello, ${name}!`;
  this.success(this.hasOption("upper") ? message.toUpperCase() : message);
}).describe("Greet someone by name");
