import type { HttpServer } from "@madda/http";

export interface RoutingConfig {
  web?: string;
  commands?: string;
  health?: string;
}

export interface WebRoutesModule {
  /** Recebe o servidor HTTP completo (`use`, rotas, `nativeApp`). */
  default: (server: HttpServer) => void | Promise<void>;
}
