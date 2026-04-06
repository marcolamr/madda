export class PathOutsideRootError extends Error {
  constructor(readonly path: string) {
    super(`Path escapes disk root: ${path}`);
    this.name = "PathOutsideRootError";
  }
}

export class DiskNotFoundError extends Error {
  constructor(readonly name: string) {
    super(`Filesystem disk not registered: "${name}"`);
    this.name = "DiskNotFoundError";
  }
}
