export class ProcessTimedOutError extends Error {
  constructor(readonly command: string, readonly args: readonly string[]) {
    super(`Process timed out: ${formatCmd(command, args)}`);
    this.name = "ProcessTimedOutError";
  }
}

export class ProcessFailedError extends Error {
  constructor(
    readonly command: string,
    readonly args: readonly string[],
    readonly exitCode: number | null,
    readonly stderr: string,
  ) {
    super(
      `Process failed (${exitCode ?? "null"}): ${formatCmd(command, args)}\n${stderr}`.trim(),
    );
    this.name = "ProcessFailedError";
  }
}

function formatCmd(command: string, args: readonly string[]): string {
  return [command, ...args].map((p) => (/\s/.test(p) ? JSON.stringify(p) : p)).join(" ");
}
