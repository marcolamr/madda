import { NavLink, Outlet, useRouteLoaderData } from "react-router-dom";
import type { RootLoaderData } from "./root-loader";
import { translateClient } from "../lib/i18n-client";
import "../global.css";

export function RootLayout() {
  const data = useRouteLoaderData("root") as RootLoaderData | undefined;
  const locale = data?.locale ?? "en";

  return (
    <main>
      <nav aria-label="Principal" style={{ marginBottom: "1.5rem" }}>
        <ul
          style={{
            display: "flex",
            gap: "1rem",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          <li>
            <NavLink
              to="/"
              end
              style={({ isActive }) => ({
                fontWeight: isActive ? 600 : 400,
                textDecoration: isActive ? "underline" : "none",
              })}
            >
              {translateClient(locale, "web.nav_home")}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/demo"
              style={({ isActive }) => ({
                fontWeight: isActive ? 600 : 400,
                textDecoration: isActive ? "underline" : "none",
              })}
            >
              {translateClient(locale, "web.nav_demo")}
            </NavLink>
          </li>
        </ul>
      </nav>
      <Outlet />
    </main>
  );
}
