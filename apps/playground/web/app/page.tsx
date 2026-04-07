import { useLoaderData } from "react-router-dom";

type HomeLoaderData = { ping: { pong?: boolean } | null; error?: number };

/** Server + client: corre no SSR e ao navegar para `/` (sem reload completo da app). */
export async function homeLoader(): Promise<HomeLoaderData> {
  const res = await fetch(`${__PLAY_WEB_INTERNAL_ORIGIN__}/v1/ping`);
  if (!res.ok) {
    return { ping: null, error: res.status };
  }
  return { ping: (await res.json()) as { pong?: boolean } };
}

/** “Server component” no sentido Madda: dados vêm do loader (Fastify), não de `useEffect` inicial. */
export function HomePage() {
  const { ping, error } = useLoaderData() as HomeLoaderData;

  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
        Madda playground — web
      </h1>
      <p className="muted" style={{ margin: "0 0 1rem" }}>
        UI integrada no mesmo processo que{" "}
        <code>routes/web.ts</code>: rotas API e webhooks mantêm-se no router Laravel-style;
        páginas React ficam em <code>web/app/</code> (estilo App Router).
      </p>
      <div className="card">
        <div className="muted">Loader → GET /v1/ping (Fastify)</div>
        <pre style={{ margin: "0.5rem 0 0", overflow: "auto" }}>
          {error !== undefined
            ? JSON.stringify({ error, ping: null }, null, 2)
            : JSON.stringify({ ping }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
