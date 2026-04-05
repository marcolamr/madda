import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { ConfigContract } from "@madda/config";
import type { ContainerContract } from "@madda/container";
import { Container } from "@madda/container";
import {
  createHttpServer,
  type CreateHttpServerOptions,
  type HttpServer,
} from "@madda/http";
import type {
  ApplicationBuilderContract,
  ApplicationConfigureOptions,
  ApplicationContract,
  ExceptionsCallback,
  MiddlewareCallback,
} from "./application-contract.js";
import { Exceptions } from "./exceptions.js";
import {
  buildCreateHttpServerOptionsFromConfig,
  mergeCreateHttpServerOptions,
} from "./http-options.js";
import { Middleware } from "./middleware.js";
import type { RoutingConfig, WebRoutesModule } from "./routing-contract.js";

export type {
  ApplicationConfigureOptions,
  ExceptionsCallback,
  MiddlewareCallback,
} from "./application-contract.js";

export class ApplicationBuilder implements ApplicationBuilderContract {
  private routing: RoutingConfig = {};
  private middlewareCallback?: MiddlewareCallback;
  private exceptionsCallback?: ExceptionsCallback;
  private httpServerOptions: CreateHttpServerOptions = {};
  private appConfig?: ConfigContract;

  constructor(private readonly basePath: string) {}

  withConfig(config: ConfigContract): ApplicationBuilderContract {
    this.appConfig = config;
    return this;
  }

  withRouting(config: RoutingConfig): ApplicationBuilderContract {
    this.routing = config;
    return this;
  }

  withMiddleware(callback: MiddlewareCallback): ApplicationBuilderContract {
    this.middlewareCallback = callback;
    return this;
  }

  withExceptions(callback: ExceptionsCallback): ApplicationBuilderContract {
    this.exceptionsCallback = callback;
    return this;
  }

  withHttpServer(options: CreateHttpServerOptions): ApplicationBuilderContract {
    this.httpServerOptions = options;
    return this;
  }

  create(): ApplicationContract {
    const container = new Container();
    const fromConfig = this.appConfig
      ? buildCreateHttpServerOptionsFromConfig(this.appConfig)
      : {};
    const httpOptions = mergeCreateHttpServerOptions(fromConfig, this.httpServerOptions);
    const http = createHttpServer(httpOptions);

    container.instance("madda.base_path", this.basePath);
    container.instance("madda.http.server", http);
    if (this.appConfig) {
      container.instance("madda.config", this.appConfig);
    }

    return new Application({
      basePath: this.basePath,
      routing: this.routing,
      container,
      http,
      config: this.appConfig,
      middlewareCallback: this.middlewareCallback,
      exceptionsCallback: this.exceptionsCallback,
    });
  }
}

type ApplicationOptions = {
  basePath: string;
  routing: RoutingConfig;
  container: ContainerContract;
  http: HttpServer;
  config?: ConfigContract;
  middlewareCallback?: MiddlewareCallback;
  exceptionsCallback?: ExceptionsCallback;
};

export class Application implements ApplicationContract {
  private httpBootstrapped = false;

  private readonly options: ApplicationOptions;

  constructor(options: ApplicationOptions) {
    this.options = options;
  }

  get basePath(): string {
    return this.options.basePath;
  }

  get container(): ContainerContract {
    return this.options.container;
  }

  get config(): ConfigContract | undefined {
    return this.options.config;
  }

  /** Internal HTTP surface; prefer {@link Application.listen}. */
  get http(): HttpServer {
    return this.options.http;
  }

  static configure(options: ApplicationConfigureOptions): ApplicationBuilderContract {
    return new ApplicationBuilder(options.basePath);
  }

  async listen(port: number, host?: string): Promise<void> {
    await this.bootstrapHttp();
    await this.options.http.listen(port, host);
  }

  async close(): Promise<void> {
    await this.options.http.close();
  }

  private async bootstrapHttp(): Promise<void> {
    if (this.httpBootstrapped) {
      return;
    }
    this.httpBootstrapped = true;

    this.options.middlewareCallback?.(new Middleware());
    this.options.exceptionsCallback?.(new Exceptions());

    const { health, web, commands } = this.options.routing;
    const { http } = this.options;

    if (health) {
      http.get(health, (ctx) => {
        ctx.reply.status(200).json({ status: "ok" });
      });
    }

    if (web) {
      const abs = resolve(this.options.basePath, web);
      const mod = (await import(pathToFileURL(abs).href)) as WebRoutesModule;
      if (typeof mod.default !== "function") {
        throw new Error(`Web routes module must export a default function: ${abs}`);
      }
      await mod.default(http);
    }

    if (commands) {
      const abs = resolve(this.options.basePath, commands);
      await import(pathToFileURL(abs).href);
    }
  }
}
