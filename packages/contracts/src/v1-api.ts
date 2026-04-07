/**
 * Caminhos da API JSON do playground (prefixo Laravel-style).
 * Alinhar com `routes/web.ts` e com `GET /v1/openapi.json` quando aplicável.
 */
export const V1_PREFIX = "/v1" as const;

export const v1Paths = {
  ping: `${V1_PREFIX}/ping`,
  openapi: `${V1_PREFIX}/openapi.json`,
  authLogin: `${V1_PREFIX}/auth/login`,
  authLogout: `${V1_PREFIX}/auth/logout`,
  authMe: `${V1_PREFIX}/auth/me`,
  demoBroadcast: `${V1_PREFIX}/demo/broadcast`,
  demoNotification: `${V1_PREFIX}/demo/notification`,
  demoError: `${V1_PREFIX}/demo/error`,
} as const;

export type V1PingResponse = {
  pong: boolean;
};

export type V1AuthLoginBody = {
  email: string;
  password: string;
};

export type V1AuthLoginResponse = {
  ok: true;
  user: Record<string, unknown>;
};

export type V1AuthMeResponse = {
  user: Record<string, unknown> | null;
};

export type V1DemoBroadcastBody = {
  channel: string;
  event?: string;
  data?: unknown;
};

/** Canais aceites por `POST .../demo/notification` no playground (validação na notification class). */
export type V1DemoNotificationChannel = "mail" | "database" | "broadcast";

export type V1DemoNotificationBody = {
  message?: string;
  channels?: V1DemoNotificationChannel[];
};

export type V1DemoNotificationResponse = {
  ok: true;
  channels: string[];
};
