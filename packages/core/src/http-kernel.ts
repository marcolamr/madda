import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createHttpServer,
  type CreateHttpServerOptions,
  type HttpServer,
} from "@madda/http";
import type { ApplicationContract } from "./application-contract.js";
import { Exceptions } from "./exceptions.js";
import {
  buildCreateHttpServerOptionsFromConfig,
  mergeCreateHttpServerOptions,
} from "./http-options.js";
import { Middleware } from "./middleware.js";
import type { WebRoutesModule } from "./routing-contract.js";

/**
 * HTTP kernel — owns the HTTP server lifecycle.
 *
 * Mirrors Laravel's Illuminate\Foundation\Http\Kernel:
 *   1. bootstrap() registers middleware, exceptions, health check, and web routes
 *   2. handle(port) starts listening
 *   3. terminate() closes the server gracefully
 *
 * Usage in main.ts:
 *   const kernel = new HttpKernel(app);
 *   await kernel.handle(Number(process.env.PORT ?? 3333));
 */
export class HttpKernel {
  private http?: HttpServer;
  private bootstrapped = false;

  constructor(
    private readonly app: ApplicationContract,
    private readonly options: CreateHttpServerOptions = {},
  ) {}

  async handle(port: number, host?: string): Promise<void> {
    await this.bootstrap();
    await this.http!.listen(port, host);
  }

  async terminate(): Promise<void> {
    await this.http?.close();
  }

  private async bootstrap(): Promise<void> {
    if (this.bootstrapped) return;
    this.bootstrapped = true;

    const fromConfig = this.app.config
      ? buildCreateHttpServerOptionsFromConfig(this.app.config)
      : {};
    this.http = createHttpServer(
      mergeCreateHttpServerOptions(fromConfig, this.options),
    );

    this.app.middlewareCallback?.(new Middleware());
    this.app.exceptionsCallback?.(new Exceptions());

    const { health, web } = this.app.routing;

    if (health) {
      this.http.get(health, (ctx) => {
        ctx.reply.status(200).json({ status: "ok" });
      });
    }

    if (web) {
      const abs = resolve(this.app.basePath, web);
      const mod = (await import(pathToFileURL(abs).href)) as WebRoutesModule;
      if (typeof mod.default !== "function") {
        throw new Error(
          `Web routes module must export a default function: ${abs}`,
        );
      }
      await mod.default(this.http);
    }
  }
}
