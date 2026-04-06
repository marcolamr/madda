import { isAbsolute, resolve } from "node:path";

/** Resolve a log file path against the application base path (Laravel `storage_path`). */
export function resolveLogPath(
  basePath: string | undefined,
  filePath: string,
): string {
  if (isAbsolute(filePath)) {
    return filePath;
  }
  return resolve(basePath ?? process.cwd(), filePath);
}
