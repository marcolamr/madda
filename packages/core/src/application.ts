import type { ConfigContract } from "@madda/config";
import type { ContainerContract } from "@madda/container";
import { Container } from "@madda/container";
import type {
  ApplicationBuilderContract,
  ApplicationConfigureOptions,
  ApplicationContract,
  ExceptionsCallback,
  MiddlewareCallback,
} from "./application-contract.js";
import type { RoutingConfig } from "./routing-contract.js";

export type {
  ApplicationConfigureOptions,
  ExceptionsCallback,
  MiddlewareCallback,
} from "./application-contract.js";

export class ApplicationBuilder implements ApplicationBuilderContract {
  private routing: RoutingConfig = {};
  private middlewareCallback?: MiddlewareCallback;
  private exceptionsCallback?: ExceptionsCallback;
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

  create(): ApplicationContract {
    const container = new Container();

    container.instance("madda.base_path", this.basePath);
    if (this.appConfig) {
      container.instance("madda.config", this.appConfig);
    }

    return new Application({
      basePath: this.basePath,
      routing: this.routing,
      container,
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
  config?: ConfigContract;
  middlewareCallback?: MiddlewareCallback;
  exceptionsCallback?: ExceptionsCallback;
};

export class Application implements ApplicationContract {
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

  get routing(): RoutingConfig {
    return this.options.routing;
  }

  get middlewareCallback(): MiddlewareCallback | undefined {
    return this.options.middlewareCallback;
  }

  get exceptionsCallback(): ExceptionsCallback | undefined {
    return this.options.exceptionsCallback;
  }

  static configure(
    options: ApplicationConfigureOptions,
  ): ApplicationBuilderContract {
    return new ApplicationBuilder(options.basePath);
  }
}
