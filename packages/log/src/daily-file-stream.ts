import { chmodSync, createWriteStream, mkdirSync, type WriteStream } from "node:fs";
import { dirname } from "node:path";
import { Writable } from "node:stream";
import type { DestinationStream } from "pino";

function datedPath(resolvedPath: string, ymd: string): string {
  const lastSlash = resolvedPath.lastIndexOf("/");
  const base = lastSlash >= 0 ? resolvedPath.slice(lastSlash + 1) : resolvedPath;
  const dir = lastSlash >= 0 ? resolvedPath.slice(0, lastSlash + 1) : "";
  const lastDot = base.lastIndexOf(".");
  if (lastDot <= 0) {
    return `${dir}${base}-${ymd}`;
  }
  const name = base.slice(0, lastDot);
  const ext = base.slice(lastDot);
  return `${dir}${name}-${ymd}${ext}`;
}

function parsePermission(permission?: string | number): number | undefined {
  if (permission === undefined) {
    return undefined;
  }
  return typeof permission === "string"
    ? Number.parseInt(permission, 8)
    : permission;
}

/**
 * Append-only log file that rolls over when the UTC calendar date changes
 * (Laravel `daily` driver analogue).
 */
export class DailyFileStream extends Writable implements DestinationStream {
  private stream: WriteStream | null = null;

  private currentYmd = "";

  private readonly permission?: number;

  constructor(
    /** Absolute path from config (e.g. …/storage/logs/laravel.log) */
    private readonly resolvedBasePath: string,
    permission?: string | number,
  ) {
    super();
    this.permission = parsePermission(permission);
  }

  private ensureStream(): void {
    const ymd = new Date().toISOString().slice(0, 10);
    if (ymd === this.currentYmd && this.stream) {
      return;
    }
    this.stream?.end();
    this.stream = null;
    const path = datedPath(this.resolvedBasePath, ymd);
    mkdirSync(dirname(path), { recursive: true });
    this.stream = createWriteStream(path, { flags: "a" });
    this.currentYmd = ymd;
    if (this.permission !== undefined) {
      try {
        chmodSync(path, this.permission);
      } catch {
        // best-effort (platform / timing)
      }
    }
  }

  override _write(
    chunk: Buffer,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    try {
      this.ensureStream();
      this.stream!.write(chunk, encoding, callback);
    } catch (e) {
      callback(e as Error);
    }
  }

  override _final(callback: (error?: Error | null) => void): void {
    if (this.stream) {
      this.stream.end(() => callback());
    } else {
      callback();
    }
  }
}
