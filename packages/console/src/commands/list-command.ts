import { Madda } from "../madda.js";
import { Command } from "../command.js";

export class ListCommand extends Command {
  readonly signature = "list";
  readonly description = "List all available commands";

  handle(): void {
    this.output.write("\x1b[32mMadda Framework\x1b[0m\n");
    this.newLine();
    this.output.write("\x1b[33mUsage:\x1b[0m\n");
    this.line("  madda <command> [arguments] [options]");
    this.newLine();
    this.output.write("\x1b[33mAvailable commands:\x1b[0m\n");

    // Group commands by namespace (the part before ":")
    const groups = new Map<string, [string, Command][]>();
    for (const [name, cmd] of Madda.all()) {
      const ns = name.includes(":") ? name.split(":")[0]! : "";
      const list = groups.get(ns) ?? [];
      list.push([name, cmd]);
      groups.set(ns, list);
    }

    // Root-level commands first (no namespace)
    for (const [name, cmd] of groups.get("") ?? []) {
      this.line(` \x1b[32m${name.padEnd(33)}\x1b[0m ${cmd.description}`);
    }

    for (const [ns, cmds] of groups) {
      if (ns === "") continue;
      this.newLine();
      this.output.write(` \x1b[33m${ns}\x1b[0m\n`);
      for (const [name, cmd] of cmds) {
        this.line(`  \x1b[32m${name.padEnd(32)}\x1b[0m ${cmd.description}`);
      }
    }
  }
}
