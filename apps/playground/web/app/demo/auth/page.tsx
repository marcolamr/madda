"use client";

import { type V1AuthMeResponse, v1Paths } from "@madda/contracts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { useRouteLoaderData } from "react-router";
import type { RootLoaderData } from "../../root-loader";
import { createBrowserApiClient } from "../../../lib/api-client";
import { translateClient } from "../../../lib/i18n-client";

const api = createBrowserApiClient();

export function AuthDemoPage() {
  const root = useRouteLoaderData("root") as RootLoaderData | undefined;
  const locale = root?.locale ?? "en";
  const [email, setEmail] = useState("demo@playground.local");
  const [password, setPassword] = useState("password");
  const qc = useQueryClient();
  const [authBusy, setAuthBusy] = useState<"login" | "logout" | null>(null);
  const [loginFailed, setLoginFailed] = useState(false);

  const me = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => api.getJson<V1AuthMeResponse>(v1Paths.authMe),
  });

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setAuthBusy("login");
    setLoginFailed(false);
    try {
      /**
       * `fetch` directo (sem `useMutation`): evita edge cases do TanStack com `networkMode` /
       * fila de mutações; o corpo JSON é sempre enviado com `Content-Length` explícito.
       */
      const res = await fetch(v1Paths.authLogin, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const text = await res.text();
      if (!res.ok) {
        setLoginFailed(true);
        return;
      }
      if (text.length) {
        JSON.parse(text) as unknown;
      }
      await qc.invalidateQueries({ queryKey: ["auth", "me"] });
    } catch {
      setLoginFailed(true);
    } finally {
      setAuthBusy(null);
    }
  }

  async function onLogout() {
    setAuthBusy("logout");
    try {
      const res = await fetch(v1Paths.authLogout, {
        method: "POST",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        await qc.invalidateQueries({ queryKey: ["auth", "me"] });
      }
    } finally {
      setAuthBusy(null);
    }
  }

  const busy = authBusy !== null;

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: "0 0 0.75rem" }}>
        {translateClient(locale, "web.auth_title")}
      </h1>
      <p className="muted" style={{ margin: "0 0 1rem", maxWidth: "40rem" }}>
        {translateClient(locale, "web.auth_blurb")}
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", margin: "0 0 0.5rem" }}>
          {translateClient(locale, "web.auth_session_heading")}
        </h2>
        {me.isLoading ? (
          <p className="muted">{translateClient(locale, "web.auth_loading")}</p>
        ) : me.isError ? (
          <p style={{ color: "var(--err)" }}>
            {translateClient(locale, "web.auth_network_error")}
          </p>
        ) : (
          <pre
            style={{
              margin: 0,
              padding: "0.75rem",
              borderRadius: 6,
              border: "1px solid var(--border)",
              fontSize: "0.85rem",
              overflow: "auto",
            }}
          >
            {JSON.stringify(me.data?.user ?? null, null, 2)}
          </pre>
        )}
      </section>

      <form
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "20rem" }}
        onSubmit={onLogin}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span>{translateClient(locale, "web.auth_email")}</span>
          <input
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            autoComplete="username"
            style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid var(--border)" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <span>{translateClient(locale, "web.auth_password")}</span>
          <input
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            autoComplete="current-password"
            style={{ padding: "0.5rem", borderRadius: 6, border: "1px solid var(--border)" }}
          />
        </label>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--border)",
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {translateClient(locale, "web.auth_login")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void onLogout()}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 6,
              border: "1px solid var(--border)",
              background: "transparent",
              cursor: busy ? "wait" : "pointer",
            }}
          >
            {translateClient(locale, "web.auth_logout")}
          </button>
        </div>
        {loginFailed ? (
          <p style={{ color: "var(--err)", margin: 0, fontSize: "0.9rem" }}>
            {translateClient(locale, "web.auth_login_failed")}
          </p>
        ) : null}
      </form>
    </div>
  );
}
