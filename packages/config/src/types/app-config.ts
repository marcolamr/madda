/**
 * Application settings (Laravel `config/app.php` shape, adapted for Node).
 */
export interface AppConfig {
  name: string;
  env: string;
  debug: boolean;
  url: string;
  timezone: string;
  locale: string;
  fallback_locale: string;
  faker_locale: string;
  cipher: string;
  key: string | undefined;
  previous_keys: string[];
  maintenance: {
    driver: string;
    store: string;
  };
}
