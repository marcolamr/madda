import {
  copyFile,
  mkdir,
  readFile,
  rename,
  rm,
  stat,
  unlink,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import type { FilesystemContract } from "./filesystem-contract.js";
import { resolveInsideRoot } from "./path-guard.js";

export class LocalFilesystem implements FilesystemContract {
  constructor(private readonly root: string) {}

  fullPath(relative: string): string {
    return resolveInsideRoot(this.root, relative);
  }

  async exists(p: string): Promise<boolean> {
    try {
      await stat(this.fullPath(p));
      return true;
    } catch {
      return false;
    }
  }

  async get(p: string): Promise<string> {
    return readFile(this.fullPath(p), "utf8");
  }

  async getBuffer(p: string): Promise<Buffer> {
    return readFile(this.fullPath(p));
  }

  async put(
    p: string,
    contents: string | Buffer,
    options?: { createDirectories?: boolean },
  ): Promise<void> {
    const target = this.fullPath(p);
    if (options?.createDirectories) {
      await mkdir(path.dirname(target), { recursive: true });
    }
    await writeFile(target, contents);
  }

  async delete(p: string): Promise<boolean> {
    const target = this.fullPath(p);
    try {
      await unlink(target);
      return true;
    } catch {
      return false;
    }
  }

  async makeDirectory(p: string, options?: { recursive?: boolean }): Promise<void> {
    await mkdir(this.fullPath(p), { recursive: options?.recursive ?? false });
  }

  async copy(from: string, to: string): Promise<void> {
    const dest = this.fullPath(to);
    await mkdir(path.dirname(dest), { recursive: true });
    await copyFile(this.fullPath(from), dest);
  }

  async move(from: string, to: string): Promise<void> {
    const dest = this.fullPath(to);
    await mkdir(path.dirname(dest), { recursive: true });
    await rename(this.fullPath(from), dest);
  }

  async size(p: string): Promise<number> {
    const s = await stat(this.fullPath(p));
    return s.size;
  }

  async lastModified(p: string): Promise<Date> {
    const s = await stat(this.fullPath(p));
    return s.mtime;
  }

  async deleteDirectory(p: string, options?: { recursive?: boolean }): Promise<void> {
    await rm(this.fullPath(p), { recursive: options?.recursive ?? false, force: true });
  }
}
