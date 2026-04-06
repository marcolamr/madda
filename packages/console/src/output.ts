const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";

export interface OutputContract {
  write(message: string): void;
  line(message: string): void;
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  newLine(count?: number): void;
}

export class Output implements OutputContract {
  constructor(
    private readonly stdout: NodeJS.WriteStream = process.stdout,
    private readonly stderr: NodeJS.WriteStream = process.stderr,
  ) {}

  write(message: string): void {
    this.stdout.write(message);
  }

  line(message: string): void {
    this.stdout.write(`${message}\n`);
  }

  info(message: string): void {
    this.stdout.write(`${CYAN}${message}${RESET}\n`);
  }

  success(message: string): void {
    this.stdout.write(`${GREEN}${message}${RESET}\n`);
  }

  warn(message: string): void {
    this.stdout.write(`${YELLOW}${message}${RESET}\n`);
  }

  error(message: string): void {
    this.stderr.write(`${RED}ERROR${RESET} ${message}\n`);
  }

  newLine(count = 1): void {
    this.stdout.write("\n".repeat(count));
  }
}
