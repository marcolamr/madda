import { renderToString } from "react-dom/server";
import {
  createStaticHandler,
  createStaticRouter,
  StaticRouterProvider,
} from "react-router-dom/server";
import { routes } from "./routes";

const { query, dataRoutes } = createStaticHandler(routes);

export async function render(url: string): Promise<string> {
  const context = await query(new Request(`http://ssr.play-web.local${url}`));
  if (context instanceof Response) {
    const t = await context.text();
    throw new Error(`Resposta inesperada SSR ${context.status}: ${t}`);
  }
  const router = createStaticRouter(dataRoutes, context);
  return renderToString(
    <StaticRouterProvider router={router} context={context} />,
  );
}
