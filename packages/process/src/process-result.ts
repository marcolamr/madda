/** Resultado de um comando — mesmo papel que `Illuminate\Process\ProcessResult`. */
export class ProcessResult {
  constructor(
    readonly exitCode: number | null,
    readonly stdout: string,
    readonly stderr: string,
  ) {}

  successful(): boolean {
    return this.exitCode === 0;
  }

  failed(): boolean {
    return !this.successful();
  }

  output(): string {
    return this.stdout;
  }

  errorOutput(): string {
    return this.stderr;
  }
}
