import type { RouteRegistrar } from "@madda/http";

export interface RoutingConfig {
  web?: string;
  commands?: string;
  health?: string;
}

export interface WebRoutesModule {
  default: (router: RouteRegistrar) => void | Promise<void>;
}
