"use client";

import { v1Paths } from "@madda/contracts";
import { useEffect, useState } from "react";
import { useRouteLoaderData } from "react-router";
import type { RootLoaderData } from "../../root-loader";
import { translateClient } from "../../../lib/i18n-client";

const CHANNEL = "playground-demo";

export function RealtimeDemoPage() {
  const root = useRouteLoaderData("root") as RootLoaderData | undefined;
  const locale = root?.locale ?? "en";
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const url = `/broadcast/sse?channel=${encodeURIComponent(CHANNEL)}`;
    const es = new EventSource(url);

    const onEvent = (ev: MessageEvent) => {
      setLines((prev) => [...prev.slice(-40), `${ev.type}: ${ev.data}`]);
    };

    es.addEventListener("hello", onEvent);
    es.addEventListener("demo", onEvent);
    es.onerror = () => {
      /* reconexão automática do EventSource */
    };

    return () => {
      es.close();
    };
  }, []);

  async function sendPing() {
    await fetch(v1Paths.demoBroadcast, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: CHANNEL,
        event: "hello",
        data: { at: Date.now(), from: "browser" },
      }),
    });
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
        {translateClient(locale, "web.realtime_title")}
      </h1>
      <p className="muted" style={{ margin: "0 0 1rem", maxWidth: "42rem" }}>
        {translateClient(locale, "web.realtime_blurb")}
      </p>
      <p style={{ margin: "0 0 0.75rem", fontSize: "0.9rem" }}>
        <code>SSE</code> <code>/broadcast/sse?channel={CHANNEL}</code>
      </p>
      <button
        type="button"
        onClick={() => void sendPing()}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: 6,
          border: "1px solid var(--border)",
          cursor: "pointer",
        }}
      >
        {translateClient(locale, "web.realtime_ping")}
      </button>
      <pre
        style={{
          margin: 0,
          padding: "0.75rem",
          borderRadius: 6,
          border: "1px solid var(--border)",
          fontSize: "0.8rem",
          maxHeight: "16rem",
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {lines.length === 0
          ? translateClient(locale, "web.realtime_empty")
          : lines.join("\n")}
      </pre>
    </div>
  );
}
