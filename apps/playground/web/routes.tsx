import type { RouteObject } from "react-router-dom";
import { RootLayout } from "./app/root-layout";
import { DemoPage } from "./app/demo/page";
import { HomePage, homeLoader } from "./app/page";

/**
 * Árvore tipo App Router: um ficheiro `page` por segmento (convénio Madda play-web).
 * Loaders correm no servidor no SSR e no client na navegação (React Router data APIs).
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
        loader: homeLoader,
      },
      {
        path: "demo",
        element: <DemoPage />,
      },
    ],
  },
];
