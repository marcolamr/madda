import { registerController, type RouteRegistrar } from "@madda/core";
import { ApiController } from "./api-controller.js";
import { AuthController } from "./auth-controller.js";

/**
 * Central place to register HTTP controllers (Laravel `app/Http/Controllers` style).
 */
export function registerHttpControllers(registrar: RouteRegistrar): void {
  registerController(registrar, ApiController);
  registerController(registrar, AuthController);
}
