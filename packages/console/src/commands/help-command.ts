import { Artisan } from "../artisan.js";
import { Command } from "../command.js";

export class HelpCommand extends Command {
  readonly signature = "help {command? : The command to show help for}";
  readonly description = "Show help for a command";

  handle(): number | void {
    const name = this.argument("command") as string | undefined;

    if (!name) {
      this.info("Usage:");
      this.line("  madda help <command>");
      return;
    }

    const cmd = Artisan.resolve(name);
    if (!cmd) {
      this.error(`Command "${name}" not found.`);
      return 1;
    }

    const parsed = cmd.getParsed();

    this.newLine();
    this.output.write(`\x1b[33mDescription:\x1b[0m\n`);
    this.line(`  ${cmd.description}`);
    this.newLine();

    this.output.write(`\x1b[33mUsage:\x1b[0m\n`);
    this.line(`  ${cmd.signature}`);

    if (parsed.arguments.length > 0) {
      this.newLine();
      this.output.write(`\x1b[33mArguments:\x1b[0m\n`);
      for (const arg of parsed.arguments) {
        const tag = arg.required ? "" : " \x1b[90m[optional]\x1b[0m";
        const desc = arg.description ?? "";
        this.line(`  \x1b[32m${arg.name.padEnd(22)}\x1b[0m${desc}${tag}`);
      }
    }

    if (parsed.options.length > 0) {
      this.newLine();
      this.output.write(`\x1b[33mOptions:\x1b[0m\n`);
      for (const opt of parsed.options) {
        const dflt =
          opt.defaultValue !== undefined ? ` \x1b[90m[default: "${opt.defaultValue}"]\x1b[0m` : "";
        const desc = opt.description ?? "";
        this.line(`  \x1b[32m--${opt.name.padEnd(20)}\x1b[0m${desc}${dflt}`);
      }
    }

    this.newLine();
  }
}
