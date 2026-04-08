import { useLoaderData } from "react-router";
import type { HomeLoaderData } from "./home-loader";

export function HomePage() {
  const data = useLoaderData() as HomeLoaderData;
  return (
    <div>
      <h1 style={{ fontSize: "1.75rem", fontWeight: 700 }}>{data.title}</h1>
      <p style={{ opacity: 0.85 }}>{data.blurb}</p>
      <pre>{JSON.stringify({ ping: data.ping, error: data.error }, null, 2)}</pre>
    </div>
  );
}
