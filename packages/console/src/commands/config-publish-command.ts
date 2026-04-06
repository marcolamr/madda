import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { ApplicationContract } from "@madda/core";
import { HASHING_CONFIG_PUBLISH_STUB } from "@madda/hashing";
import { Command } from "../command.js";

export class ConfigPublishCommand extends Command {
  readonly signature =
    "config:publish {name : Config stub to publish (e.g. hashing)} {--force : Overwrite if the file already exists}";
  readonly description =
    "Publish a config stub into the application (Laravel-style `config:publish`)";

  constructor(private readonly app: ApplicationContract) {
    super();
  }

  handle(): number {
    const name = String(this.argument("name") ?? "").trim();
    if (name !== "hashing") {
      this.error(
        `Unknown config "${name}". Supported: hashing (run: madda config:publish hashing)`,
      );
      return 1;
    }

    const dest = resolve(this.app.basePath, "config", "hashing.ts");
    if (existsSync(dest) && !this.hasOption("force")) {
      this.error(
        `File already exists: ${dest}\nPass --force to overwrite.`,
      );
      return 1;
    }

    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, HASHING_CONFIG_PUBLISH_STUB, "utf8");
    this.success(`Published ${dest}`);
    return 0;
  }
}
