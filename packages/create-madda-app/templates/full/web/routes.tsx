import type { RouteObject } from "react-router";
import { HomePage } from "./app/page";
import { homeLoader } from "./app/home-loader";
import { RootLayout } from "./app/root-layout";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <RootLayout />,
    children: [{ index: true, element: <HomePage />, loader: homeLoader }],
  },
];
