import { useLoaderData } from "react-router";
import type { HomeLoaderData } from "./home-loader";

/** “Server component” no sentido Madda: dados vêm do loader (Fastify), não de `useEffect` inicial. */
export function HomePage() {
  const { ping, error, welcome, blurb, title, loaderIntro } =
    useLoaderData() as HomeLoaderData;

  return (
    <div>
      <p className="muted" style={{ margin: "0 0 0.75rem" }}>
        {welcome}
      </p>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0 0 0.5rem" }}>
        {title}
      </h1>
      <p className="muted" style={{ margin: "0 0 1rem" }}>
        {blurb}
      </p>
      <div className="card">
        <div className="muted">{loaderIntro}</div>
        <pre style={{ margin: "0.5rem 0 0", overflow: "auto" }}>
          {error !== undefined
            ? JSON.stringify({ error, ping: null }, null, 2)
            : JSON.stringify({ ping }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
