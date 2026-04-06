import type { ParsedSignature } from "./signature-parser.js";

export interface InputContract {
  argument(name: string): string | string[] | undefined;
  arguments(): Record<string, string | string[] | undefined>;
  option(name: string): string | boolean | string[] | undefined;
  options(): Record<string, string | boolean | string[] | undefined>;
  hasOption(name: string): boolean;
}

/**
 * Parses raw argv tokens against a parsed signature and exposes named
 * arguments and options — mirroring Symfony Console's InputInterface.
 */
export class Input implements InputContract {
  private readonly _args: Record<string, string | string[] | undefined> = {};
  private readonly _opts: Record<string, string | boolean | string[] | undefined> = {};

  constructor(argv: string[], sig: ParsedSignature) {
    this.parse(argv, sig);
  }

  private parse(argv: string[], sig: ParsedSignature): void {
    const positional: string[] = [];

    for (let i = 0; i < argv.length; i++) {
      const token = argv[i]!;

      if (token.startsWith("--")) {
        const eqIdx = token.indexOf("=");

        if (eqIdx !== -1) {
          // --option=value
          this._opts[token.slice(2, eqIdx)] = token.slice(eqIdx + 1);
        } else {
          const optName = token.slice(2);
          const def = sig.options.find((o) => o.name === optName);
          const next = argv[i + 1];

          if (def?.acceptsValue && next !== undefined && !next.startsWith("--")) {
            this._opts[optName] = next;
            i++;
          } else {
            this._opts[optName] = true;
          }
        }
      } else {
        positional.push(token);
      }
    }

    // Map positional tokens to named argument slots
    let pos = 0;
    for (const argDef of sig.arguments) {
      if (argDef.isArray) {
        this._args[argDef.name] = positional.slice(pos);
        pos = positional.length;
      } else {
        this._args[argDef.name] = positional[pos] ?? argDef.defaultValue;
        pos++;
      }
    }

    // Apply option defaults for unset options
    for (const optDef of sig.options) {
      if (!(optDef.name in this._opts)) {
        this._opts[optDef.name] = optDef.defaultValue;
      }
    }
  }

  argument(name: string): string | string[] | undefined {
    return this._args[name];
  }

  arguments(): Record<string, string | string[] | undefined> {
    return { ...this._args };
  }

  option(name: string): string | boolean | string[] | undefined {
    return this._opts[name];
  }

  options(): Record<string, string | boolean | string[] | undefined> {
    return { ...this._opts };
  }

  hasOption(name: string): boolean {
    const val = this._opts[name];
    return val !== undefined && val !== false;
  }
}
