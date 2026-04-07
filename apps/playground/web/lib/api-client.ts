import { createHttpClient } from "@madda/http-client";

/** Cliente browser: envia cookies `httpOnly` da sessão (sem `localStorage` para segredos). */
export function createBrowserApiClient() {
  return createHttpClient({
    credentials: "include",
  });
}
