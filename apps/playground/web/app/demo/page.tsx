"use client";

import { useState } from "react";
import { Link, useRouteLoaderData } from "react-router";
import type { RootLoaderData } from "../root-loader";
import { translateClient } from "../../lib/i18n-client";

/**
 * Ilha client: marca `"use client"` para documentar o convénio (futuro: bundling só client).
 * Hoje o Vite inclui este módulo no bundle partilhado; o estado é só no browser após hidratação.
 */
export function DemoPage() {
  const [n, setN] = useState(0);
  const root = useRouteLoaderData("root") as RootLoaderData | undefined;
  const locale = root?.locale ?? "en";

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
        {translateClient(locale, "web.demo_title")}
      </h1>
      <p className="muted" style={{ margin: "0 0 1rem" }}>
        {translateClient(locale, "web.demo_hint")}{" "}
        <code>NavLink</code>
      </p>
      <button
        type="button"
        onClick={() => setN((x) => x + 1)}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: 6,
          border: "1px solid var(--border)",
          background: "transparent",
          color: "inherit",
          cursor: "pointer",
        }}
      >
        Contador: {n}
      </button>
      <ul className="muted" style={{ margin: "1.25rem 0 0", paddingLeft: "1.25rem" }}>
        <li>
          <Link to="/demo/auth">{translateClient(locale, "web.demo_link_auth")}</Link>
        </li>
        <li>
          <Link to="/demo/realtime">{translateClient(locale, "web.demo_link_realtime")}</Link>
        </li>
      </ul>
    </div>
  );
}
