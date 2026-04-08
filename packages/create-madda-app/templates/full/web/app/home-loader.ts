export type HomeLoaderData = {
  title: string;
  blurb: string;
  ping: { pong?: boolean } | null;
  error?: number;
};

export async function homeLoader(): Promise<HomeLoaderData> {
  const title = "{{APP_DISPLAY_NAME}}";
  const blurb =
    "React + Vite SSR via @madda/play-web. API lives in routes/web.ts (e.g. GET /v1/ping).";

  if (import.meta.env.SSR) {
    return { title, blurb, ping: { pong: true } };
  }

  const res = await fetch("/v1/ping", { credentials: "include" });
  if (!res.ok) {
    return { title, blurb, ping: null, error: res.status };
  }
  try {
    return { title, blurb, ping: (await res.json()) as { pong?: boolean } };
  } catch {
    return { title, blurb, ping: null };
  }
}
