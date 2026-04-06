import type { FilesystemContract } from "./filesystem-contract.js";
import { DiskNotFoundError } from "./errors.js";

/** Registo nomeado de discos (mental model: `Illuminate\Filesystem\FilesystemManager`). */
export class FilesystemManager {
  private readonly disks = new Map<string, FilesystemContract>();

  constructor(initial?: Record<string, FilesystemContract>) {
    if (initial) {
      for (const [name, disk] of Object.entries(initial)) {
        this.disks.set(name, disk);
      }
    }
  }

  mount(name: string, disk: FilesystemContract): this {
    this.disks.set(name, disk);
    return this;
  }

  disk(name = "local"): FilesystemContract {
    const d = this.disks.get(name);
    if (!d) {
      throw new DiskNotFoundError(name);
    }
    return d;
  }

  has(name: string): boolean {
    return this.disks.has(name);
  }
}
