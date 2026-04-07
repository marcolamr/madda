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

/** 32 bytes UTF-8 — formato Laravel `base64:` para sessão/encriptação em local sem `.env`. */
function playgroundLocalDevAppKey(): string {
  const bytes = "0123456789abcdef0123456789abcdef";
  return `base64:${Buffer.from(bytes, "utf8").toString("base64")}`;
}

const rawAppKey = env("APP_KEY");
const trimmedAppKey = rawAppKey?.trim().replace(/^["']|["']$/g, "") ?? "";
const appEnvLower = (env("APP_ENV", "local") ?? "local").toLowerCase();
const useLocalDevKey = trimmedAppKey.length === 0 && appEnvLower === "local";

if (useLocalDevKey && typeof process.stderr?.write === "function") {
  process.stderr.write(
    "[madda/playground] APP_KEY is empty — using built-in local dev key. " +
      "Set APP_KEY (e.g. pnpm madda key:generate) before non-local deploy.\n",
  );
}

/**
 * Laravel `config/app.php` adapted for Node (see Illuminate\Config).
 */
const appConfig = {
  name: env("APP_NAME", "Madda Playground")!,
  env: env("APP_ENV", "local")!,
  debug: envBool("APP_DEBUG", true),
  url: env("APP_URL", "http://localhost")!,
  timezone: env("APP_TIMEZONE", "UTC")!,
  locale: env("APP_LOCALE", "en")!,
  fallback_locale: env("APP_FALLBACK_LOCALE", "en")!,
  faker_locale: env("APP_FAKER_LOCALE", "en_US")!,
  cipher: "AES-256-CBC",
  key: useLocalDevKey
    ? playgroundLocalDevAppKey()
    : trimmedAppKey.length > 0
      ? trimmedAppKey
      : (rawAppKey ?? ""),
  previous_keys: previousKeys,
  maintenance: {
    driver: env("APP_MAINTENANCE_DRIVER", "file")!,
    store: env("APP_MAINTENANCE_STORE", "database")!,
  },
} satisfies AppConfig;

export default appConfig;
