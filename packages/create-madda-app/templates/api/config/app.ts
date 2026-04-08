import type { AppConfig } from "@madda/core";

const env = (key: string, fallback?: string): string | undefined =>
  process.env[key] ?? fallback;

const envBool = (key: string, fallback: boolean): boolean => {
  const v = process.env[key];
  if (v === undefined) {
    return fallback;
  }
  return v === "1" || v.toLowerCase() === "true";
};

const previousKeys = (env("APP_PREVIOUS_KEYS", "") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/**
 * Laravel `config/app.php` shape (see `@madda/config` / `AppConfig`).
 */
const appConfig = {
  name: env("APP_NAME", "{{APP_DISPLAY_NAME}}")!,
  env: env("APP_ENV", "local")!,
  debug: envBool("APP_DEBUG", true),
  url: env("APP_URL", "http://localhost")!,
  timezone: env("APP_TIMEZONE", "UTC")!,
  locale: env("APP_LOCALE", "en")!,
  fallback_locale: env("APP_FALLBACK_LOCALE", "en")!,
  faker_locale: env("APP_FAKER_LOCALE", "en_US")!,
  cipher: "AES-256-CBC",
  key: (env("APP_KEY")?.trim().replace(/^["']|["']$/g, "") ?? "") as string | undefined,
  previous_keys: previousKeys,
  maintenance: {
    driver: env("APP_MAINTENANCE_DRIVER", "file")!,
    store: env("APP_MAINTENANCE_STORE", "database")!,
  },
} satisfies AppConfig;

export default appConfig;
