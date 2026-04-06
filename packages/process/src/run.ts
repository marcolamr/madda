import { spawn } from "node:child_process";
import { ProcessFailedError, ProcessTimedOutError } from "./errors.js";
import { ProcessResult } from "./process-result.js";

export type RunProcessOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  /** Texto enviado a stdin (fechado após escrita). */
  input?: string | Buffer;
  /** Força `shell: true` no `spawn`. */
  shell?: boolean;
  /** Aborta e envia SIGTERM após N ms. */
  timeoutMs?: number;
  /** Se true e exit code ≠ 0, lança `ProcessFailedError`. */
  throwOnFailure?: boolean;
};

function collectStream(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c: Buffer | string) => {
      chunks.push(typeof c === "string" ? Buffer.from(c) : c);
    });
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    stream.on("error", reject);
  });
}

/**
 * Executa um comando (mental model: `Illuminate\Process\Process::run`).
 *
 * @example
 * await runProcess("node", ["-e", "console.log(1)"]);
 */
export async function runProcess(
  command: string,
  args: readonly string[] = [],
  options: RunProcessOptions = {},
): Promise<ProcessResult> {
  const useShell = options.shell ?? false;
  const hasInput = options.input !== undefined;
  const child = spawn(command, [...args], {
    cwd: options.cwd,
    env: options.env ? { ...process.env, ...options.env } : process.env,
    shell: useShell,
    stdio: [hasInput ? "pipe" : "ignore", "pipe", "pipe"],
  });

  let timedOut = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutMs = options.timeoutMs;
  if (timeoutMs !== undefined && timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");
    }, timeoutMs);
  }

  const stdinEnd = new Promise<void>((resolve, reject) => {
    if (!hasInput) {
      resolve();
      return;
    }
    const sin = child.stdin;
    if (!sin) {
      resolve();
      return;
    }
    sin.write(options.input as string | Buffer, (err) => {
      if (err) {
        reject(err);
        return;
      }
      sin.end(() => resolve());
    });
  });

  const stdoutP = child.stdout ? collectStream(child.stdout) : Promise.resolve("");
  const stderrP = child.stderr ? collectStream(child.stderr) : Promise.resolve("");

  const code: number | null = await new Promise((resolve) => {
    child.once("close", (c) => resolve(c));
    child.once("error", () => resolve(null));
  });

  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
  }

  await stdinEnd.catch(() => undefined);
  const stdout = await stdoutP;
  const stderr = await stderrP;

  if (timedOut) {
    throw new ProcessTimedOutError(command, args);
  }

  const result = new ProcessResult(code, stdout, stderr);

  if (options.throwOnFailure && result.failed()) {
    throw new ProcessFailedError(command, args, code, stderr);
  }

  return result;
}
