import { NavLink, Outlet } from "react-router-dom";
import "../global.css";

export function RootLayout() {
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
              Início
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
              Demo
            </NavLink>
          </li>
        </ul>
      </nav>
      <Outlet />
    </main>
  );
}
