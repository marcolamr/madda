import path from "node:path";
import fastifyMiddie from "@fastify/middie";
import type { HttpServer } from "@madda/http";
import type { FastifyInstance } from "fastify";
import { createServer as createViteServer } from "vite";
import { wantsHtmlDocument } from "./wants-html.js";

export type RegisterPlayWebDevOptions = {
  /** Pasta com `index.html`, `vite.config.ts`, `entry-*.tsx` (ex.: `apps/playground/web`). */
  webRoot: string;
  /** Porta onde o Fastify está a ouvir (fetch interno nos loaders). */
  serverPort: number;
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

/**
 * Integra Vite em modo middleware + SSR React Router no mesmo servidor que as rotas Laravel-style.
 * Registar **depois** das rotas explícitas (hook `afterWeb` no HttpKernel): pedidos documento HTML
 * sem rota dedicada usam o not-found handler; `/v1/*`, `/up`, webhooks, etc. mantêm prioridade.
 */
export async function registerPlayWebDev(
  http: HttpServer,
  options: RegisterPlayWebDevOptions,
): Promise<void> {
  const fastify = asFastify(http);
  const { webRoot, serverPort } = options;

  await fastify.register(fastifyMiddie);

  const vite = await createViteServer({
    root: webRoot,
    configFile: path.join(webRoot, "vite.config.ts"),
    server: {
      middlewareMode: true,
      hmr: { server: fastify.server },
    },
    appType: "custom",
    /**
     * `__PLAY_*` vivem em `web/vite.config.ts` (loadEnv + define) para o client transform
     * sempre substituir (navegação SPA). Aqui só forçamos a origem real do servidor se
     * difere de `PORT` no .env (ex. porta passada na CLI).
     */
    define: {
      __PLAY_WEB_INTERNAL_ORIGIN__: JSON.stringify(
        `http://127.0.0.1:${serverPort}`,
      ),
    },
  });

  fastify.use(vite.middlewares);

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
