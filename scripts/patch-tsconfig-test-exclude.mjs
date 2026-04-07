import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (
      e.isDirectory() &&
      e.name !== "node_modules" &&
      e.name !== "dist" &&
      e.name !== ".turbo"
    ) {
      walk(p, acc);
    } else if (e.isFile() && e.name === "tsconfig.json") {
      acc.push(p);
    }
  }
  return acc;
}

const needle = '"exclude": ["node_modules", "dist"]';
const repl = '"exclude": ["node_modules", "dist", "**/*.test.ts"]';

for (const r of ["packages", "apps"]) {
  const base = join(process.cwd(), r);
  for (const f of walk(base)) {
    let c = readFileSync(f, "utf8");
    if (c.includes(needle) && !c.includes("**/*.test.ts")) {
      c = c.replace(needle, repl);
      writeFileSync(f, c);
    }
  }
}
