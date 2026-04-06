import { ClosureCommand, type ClosureHandler } from "./closure-command.js";
import type { Command } from "./command.js";

/**
 * Static command registry — mirrors Laravel's Artisan facade.
 *
 * Used in routes/console.ts to register closure commands:
 *
 *   Artisan.command("inspire", function () {
 *     this.line("Keep it simple.");
 *   }).describe("Display an inspiring quote");
 *
 * Class-based commands are registered via Artisan.register().
 */
export class Artisan {
  private static readonly _commands: Map<string, Command> = new Map();

  /** Register a closure as a command. Returns the ClosureCommand for chaining. */
  static command(signature: string, handler: ClosureHandler): ClosureCommand {
    const cmd = new ClosureCommand(signature, handler);
    this._commands.set(cmd.name, cmd);
    return cmd;
  }

  /** Register a class-based command instance. */
  static register(command: Command): void {
    this._commands.set(command.name, command);
  }

  /** Resolve a command by name. */
  static resolve(name: string): Command | undefined {
    return this._commands.get(name);
  }

  /** @internal — used by ConsoleKernel */
  static all(): Map<string, Command> {
    return this._commands;
  }
}
