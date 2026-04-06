/** Contrato de disco — base para local, S3, etc. (mental model: `Illuminate\Contracts\Filesystem\Filesystem`). */
export interface FilesystemContract {
  exists(path: string): Promise<boolean>;

  get(path: string): Promise<string>;

  getBuffer(path: string): Promise<Buffer>;

  put(
    path: string,
    contents: string | Buffer,
    options?: { createDirectories?: boolean },
  ): Promise<void>;

  /** Devolve false se o ficheiro não existia. */
  delete(path: string): Promise<boolean>;

  makeDirectory(path: string, options?: { recursive?: boolean }): Promise<void>;

  copy(from: string, to: string): Promise<void>;

  move(from: string, to: string): Promise<void>;

  size(path: string): Promise<number>;

  lastModified(path: string): Promise<Date>;

  /** Remove diretório (implementações cloud podem usar prefixo). */
  deleteDirectory(path: string, options?: { recursive?: boolean }): Promise<void>;

  /** Caminho absoluto seguro dentro da raiz do disco. */
  fullPath(relative: string): string;
}
