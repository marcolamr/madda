import type { InputContract } from "./input.js";
import type { OutputContract } from "./output.js";
import type { ParsedSignature } from "./signature-parser.js";
import { parseSignature } from "./signature-parser.js";

/**
 * Base class for all console commands — mirrors Laravel's Illuminate\Console\Command.
 *
 * Subclasses must declare `signature` and `description`, then implement `handle()`.
 * The kernel calls `_boot()` before `handle()` to inject Input/Output.
 */
export abstract class Command {
  /** Full Artisan-style signature, e.g. "mail:send {user} {--queue=default}" */
  abstract readonly signature: string;
  abstract readonly description: string;

  protected input!: InputContract;
  protected output!: OutputContract;

  private _parsed?: ParsedSignature;

  get name(): string {
    return this.getParsed().name;
  }

  getParsed(): ParsedSignature {
    this._parsed ??= parseSignature(this.signature);
    return this._parsed;
  }

  /** @internal — called by ConsoleKernel before handle() */
  _boot(input: InputContract, output: OutputContract): void {
    this.input = input;
    this.output = output;
  }

  abstract handle(): Promise<number | void> | number | void;

  // Convenience proxies — same API as Laravel's Command helpers

  argument(name: string): string | string[] | undefined {
    return this.input.argument(name);
  }

  option(name: string): string | boolean | string[] | undefined {
    return this.input.option(name);
  }

  hasOption(name: string): boolean {
    return this.input.hasOption(name);
  }

  line(message: string): void {
    this.output.line(message);
  }

  info(message: string): void {
    this.output.info(message);
  }

  success(message: string): void {
    this.output.success(message);
  }

  warn(message: string): void {
    this.output.warn(message);
  }

  error(message: string): void {
    this.output.error(message);
  }

  newLine(count?: number): void {
    this.output.newLine(count);
  }
}
