import path from "node:path";
import { PathOutsideRootError } from "./errors.js";

/** Resolve `userPath` dentro de `root` (bloqueia segmentos `..` que saem da raiz). */
export function resolveInsideRoot(root: string, userPath: string): string {
  const r = path.resolve(root);
  const full = path.resolve(r, userPath);
  const rel = path.relative(r, full);
  const parts = rel.split(path.sep).filter((p) => p.length > 0);
  if (parts.includes("..")) {
    throw new PathOutsideRootError(userPath);
  }
  return full;
}
