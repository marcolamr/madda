import type { FastifyRequest } from "fastify";

/** Evita tratar pedidos API (`fetch` JSON, webhooks) como navegação de documento. */
export function wantsHtmlDocument(req: FastifyRequest): boolean {
  const pathname = ((req.url.split("?")[0] ?? "/").split("#")[0] ?? "/").replace(
    /\/$/,
    "",
  ) || "/";
  if (pathname.startsWith("/v1")) return false;

  const dest = req.headers["sec-fetch-dest"];
  if (dest === "document") return true;
  const mode = req.headers["sec-fetch-mode"];
  if (mode === "navigate") return true;
  const accept = req.headers.accept ?? "";
  if (accept.includes("text/html")) return true;
  if (accept === "*/*" || accept.trim() === "") return true;
  return false;
}
