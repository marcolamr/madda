import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import type { HttpServer } from "@madda/http";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { createServer as createViteServer } from "vite";
import { wantsHtmlDocument } from "./wants-html.js";

/** Porta WS dedicada ao HMR quando não usamos `hmr.server` (evita colisão com `@fastify/websocket`). */
const DEFAULT_VITE_HMR_PORT = 24678;

export type RegisterPlayWebDevOptions = {
  /** Pasta com `index.html`, `vite.config.ts`, `entry-*.tsx` (ex.: `apps/playground/web`). */
  webRoot: string;
  /** Porta onde o Fastify está a ouvir (fetch interno nos loaders). */
  serverPort: number;
  /**
   * Porta do WebSocket só para HMR do Vite. Não reutilizar `serverPort`: com `@fastify/websocket`
   * no mesmo `http.Server`, `hmr: { server }` faz o upgrade cair no Fastify → "Invalid frame header"
   * e o cliente fica em loop a perder ligação / a fazer polling.
   */
  viteHmrPort?: number;
};

function asFastify(http: HttpServer): FastifyInstance {
  const native = http.nativeApp?.();
  if (!native || typeof native !== "object") {
    throw new Error(
      "@madda/play-web: nativeApp() não é Fastify — usa o driver Fastify em @madda/http.",
    );
  }
  return native as FastifyInstance;
}

function pathnameOnly(url: string | undefined): string {
  if (!url) {
    return "/";
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const p = new URL(url).pathname;
      return p.length ? p : "/";
    } catch {
      /* fall through */
    }
  }
  const noQuery = url.split("?")[0] ?? "/";
  const noHash = noQuery.split("#")[0] ?? "/";
  const withSlash = noHash.startsWith("/") ? noHash : `/${noHash}`;
  const collapsed = withSlash.replace(/\/{2,}/g, "/");
  return collapsed.length ? collapsed : "/";
}

/**
 * Pedidos à API / health / broadcasting não devem passar pelo stack Connect do Vite.
 */
function shouldServeOutsideVite(pathname: string): boolean {
  if (pathname === "/v1" || pathname.startsWith("/v1/")) {
    return true;
  }
  if (pathname === "/up" || pathname.startsWith("/up/")) {
    return true;
  }
  if (pathname.startsWith("/broadcast/")) {
    return true;
  }
  return false;
}

type ConnectNext = (err?: unknown) => void;

function rawResponseDone(res: ServerResponse): boolean {
  return res.writableEnded === true || res.finished === true;
}

/**
 * Integra Vite em modo middleware + SSR React Router no mesmo servidor que as rotas Laravel-style.
 *
 * **Sem `@fastify/middie`:** o engine do middie corre no hook `onRequest` e, em alguns cenários com
 * POST + corpo, o ciclo Fastify (`preParsing` / rotas) não progredia — no browser o pedido ficava
 * em *pending* com "Provisional headers" e nunca chegava ao handler Madda. Aqui chamamos o Connect
 * do Vite directamente no `onRequest` e só invocamos `done()` quando o Vite não respondeu sozinho.
 */
export async function registerPlayWebDev(
  http: HttpServer,
  options: RegisterPlayWebDevOptions,
): Promise<void> {
  const fastify = asFastify(http);
  const { webRoot, serverPort } = options;
  const viteHmrPort = options.viteHmrPort ?? DEFAULT_VITE_HMR_PORT;

  const vite = await createViteServer({
    root: webRoot,
    configFile: path.join(webRoot, "vite.config.ts"),
    server: {
      middlewareMode: true,
      hmr: {
        port: viteHmrPort,
        clientPort: viteHmrPort,
      },
    },
    appType: "custom",
    define: {
      __PLAY_WEB_INTERNAL_ORIGIN__: JSON.stringify(
        `http://127.0.0.1:${serverPort}`,
      ),
    },
  });

  const viteStack = vite.middlewares as (
    req: IncomingMessage,
    res: ServerResponse,
    next: ConnectNext,
  ) => unknown;

  fastify.addHook(
    "onRequest",
    (request: FastifyRequest, reply: FastifyReply, done) => {
      const method = (request.method ?? "GET").toUpperCase();
      if (method !== "GET" && method !== "HEAD") {
        done();
        return;
      }
      const pathname = pathnameOnly(request.raw.url);
      if (shouldServeOutsideVite(pathname)) {
        done();
        return;
      }
      viteStack(request.raw, reply.raw, (err?: unknown) => {
        if (err) {
          done(err as Error);
          return;
        }
        if (rawResponseDone(reply.raw)) {
          return;
        }
        done();
      });
    },
  );

  fastify.setNotFoundHandler(async (req, reply) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      return reply.status(404).send({ message: "Not Found", statusCode: 404 });
    }
    if (!wantsHtmlDocument(req)) {
      return reply.status(404).send({ message: "Not Found", statusCode: 404 });
    }

    const url = req.url;
    const templatePath = path.join(webRoot, "index.html");
    const template = await import("node:fs/promises").then((fs) =>
      fs.readFile(templatePath, "utf-8"),
    );

    try {
      const html = await vite.transformIndexHtml(url, template);
      const mod = (await vite.ssrLoadModule("/entry-server.tsx")) as {
        render: (url: string) => Promise<string>;
      };
      if (typeof mod.render !== "function") {
        throw new Error("entry-server.tsx must export async function render(url: string)");
      }
      const appHtml = await mod.render(url);
      const out = html.replace("<!--ssr-outlet-->", appHtml);
      return reply.type("text/html").send(out);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      fastify.log.error(e);
      return reply
        .status(500)
        .type("text/html")
        .send(`<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>
        <h1>Erro SSR (play-web)</h1>
        <pre>${String((e as Error).message)}</pre>
        <p>Em dev, o Vite mostra overlay no browser quando o erro vem do grafo client.</p>
        </body></html>`);
    }
  });
}
