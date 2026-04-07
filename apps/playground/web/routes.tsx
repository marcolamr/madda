import type { RouteObject } from "react-router";
import { RootLayout } from "./app/root-layout";
import { rootLoader } from "./app/root-loader";
import { DemoPage } from "./app/demo/page";
import { homeLoader } from "./app/home-loader";
import { HomePage } from "./app/page";

/**
 * Árvore tipo App Router: um ficheiro `page` por segmento (convénio Madda play-web).
 * Loaders correm no servidor no SSR e no client na navegação (React Router data APIs).
 */
export const routes: RouteObject[] = [
  {
    id: "root",
    path: "/",
    element: <RootLayout />,
    loader: rootLoader,
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
