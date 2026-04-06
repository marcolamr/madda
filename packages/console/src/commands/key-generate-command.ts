import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ApplicationContract } from "@madda/core";
import { Encrypter } from "@madda/encryption";
import { Command } from "../command.js";

function upsertEnvLine(content: string, key: string, value: string): string {
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(content)) {
    return content.replace(re, line);
  }
  const trimmed = content.replace(/\s*$/, "");
  const sep = trimmed === "" ? "" : "\n";
  return `${trimmed}${sep}${line}\n`;
}

export class KeyGenerateCommand extends Command {
  readonly signature = "key:generate {--show : Only print the key; do not write .env}";
  readonly description =
    "Set the application APP_KEY (Laravel-style base64 key for encryption)";

  constructor(private readonly app: ApplicationContract) {
    super();
  }

  handle(): number | void {
    const cipher =
      (this.app.config?.get<string>("app.cipher") as string | undefined) ??
      "AES-256-CBC";
    const key = Encrypter.generateFormattedKey(cipher);

    if (this.hasOption("show")) {
      this.line(key);
      return;
    }

    const envPath = resolve(this.app.basePath, ".env");
    const examplePath = resolve(this.app.basePath, ".env.example");

    let content = "";
    if (existsSync(envPath)) {
      content = readFileSync(envPath, "utf8");
    } else if (existsSync(examplePath)) {
      content = readFileSync(examplePath, "utf8");
    }

    const next = upsertEnvLine(content, "APP_KEY", key);
    writeFileSync(envPath, next, "utf8");
    this.success(`Application key set in ${envPath}`);
  }
}
