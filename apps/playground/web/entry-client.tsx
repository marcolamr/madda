import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";

const el = document.getElementById("root");
if (!el) {
  throw new Error("#root em falta");
}

hydrateRoot(
  el,
  <StrictMode>
    <RouterProvider
      router={createBrowserRouter(routes, {
        future: {
          // @ts-expect-error FutureConfig em RR 6.28.x omite esta flag; o runtime suporta (aviso v7).
          v7_startTransition: true,
        },
      })}
    />
  </StrictMode>,
);
