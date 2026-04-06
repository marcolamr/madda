import { LocalFilesystem } from "./local-filesystem.js";

/** Disco local com raiz absoluta (ex.: `storage_path('app')`). */
export function localDisk(root: string): LocalFilesystem {
  return new LocalFilesystem(root);
}
