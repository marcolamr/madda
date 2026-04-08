import { Outlet } from "react-router";
import "../global.css";

export function RootLayout() {
  return (
    <main>
      <Outlet />
    </main>
  );
}
