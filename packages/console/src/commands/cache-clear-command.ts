import type { ApplicationContract } from "@madda/core";
import { createCacheManagerFromConfig } from "@madda/cache";
import { Command } from "../command.js";

export class CacheClearCommand extends Command {
  readonly signature =
    "cache:clear {--store= : Cache store name (default: configured default store)} {--all : Flush every configured cache store}";
  readonly description = "Flush the application cache";

  constructor(private readonly app: ApplicationContract) {
    super();
  }

  async handle(): Promise<number | void> {
    const config = this.app.config;
    if (!config) {
      this.error("Application config is not available.");
      return 1;
    }

    const manager = createCacheManagerFromConfig(config);

    if (this.hasOption("all")) {
      const names = manager.storeNames();
      for (const name of names) {
        await manager.store(name).flush();
        this.line(`Flushed cache store [${name}].`);
      }
      this.success(`Flushed ${names.length} store(s).`);
      return;
    }

    const storeOpt = this.option("store");
    const storeName =
      typeof storeOpt === "string" && storeOpt.trim() !== "" ? storeOpt.trim() : undefined;

    if (storeName !== undefined) {
      if (!manager.has(storeName)) {
        this.error(`Unknown cache store "${storeName}". Available: ${manager.storeNames().join(", ")}`);
        return 1;
      }
      await manager.store(storeName).flush();
      this.success(`Flushed cache store [${storeName}].`);
      return;
    }

    await manager.store().flush();
    this.success(`Flushed cache store [${manager.defaultStoreName()}].`);
  }
}
