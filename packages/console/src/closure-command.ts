import { Command } from "./command.js";

export type ClosureHandler = (
  this: ClosureCommand,
) => void | number | Promise<void | number>;

/**
 * Wraps a plain function as a Command — equivalent to Laravel's
 * Artisan::command() closure commands defined in routes/console.ts.
 */
export class ClosureCommand extends Command {
  readonly signature: string;
  description = "";

  private readonly handler: ClosureHandler;

  constructor(signature: string, handler: ClosureHandler) {
    super();
    this.signature = signature;
    this.handler = handler;
  }

  /** Chainable — sets the description shown in `list`. */
  describe(description: string): this {
    this.description = description;
    return this;
  }

  async handle(): Promise<number | void> {
    return this.handler.call(this);
  }
}
