import type { ProcessResult } from "./process-result.js";
import { runProcess, type RunProcessOptions } from "./run.js";

/**
 * Builder fluente (cwd, timeout, env, stdin) antes de `run(command, args?)`.
 */
export class PendingProcess {
  private cwd?: string;
  private extraEnv: NodeJS.ProcessEnv = {};
  private inputData?: string | Buffer;
  private shell = false;
  private timeoutMs?: number;
  private throwOnFailure = false;

  path(dir: string): this {
    this.cwd = dir;
    return this;
  }

  timeout(ms: number): this {
    this.timeoutMs = ms;
    return this;
  }

  env(key: string, value: string): this {
    this.extraEnv[key] = value;
    return this;
  }

  input(data: string | Buffer): this {
    this.inputData = data;
    return this;
  }

  useShell(enabled = true): this {
    this.shell = enabled;
    return this;
  }

  throwsFailure(enabled = true): this {
    this.throwOnFailure = enabled;
    return this;
  }

  async run(command: string, args: readonly string[] = []): Promise<ProcessResult> {
    const opts: RunProcessOptions = {
      cwd: this.cwd,
      env: Object.keys(this.extraEnv).length > 0 ? this.extraEnv : undefined,
      input: this.inputData,
      shell: this.shell,
      timeoutMs: this.timeoutMs,
      throwOnFailure: this.throwOnFailure,
    };
    return runProcess(command, args, opts);
  }
}

/** Evita colidir com o global `process` do Node. */
export function pendingProcess(): PendingProcess {
  return new PendingProcess();
}
