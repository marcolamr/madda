import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

/** `define` aqui garante substituição em todo o grafo client (incl. loaders na navegação SPA). */
export default defineConfig(({ mode }) => {
  const playgroundRoot = path.resolve(__dirname, "..");
  const env = loadEnv(mode, playgroundRoot, "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@web": path.resolve(__dirname, "."),
      },
    },
    define: {
      __PLAY_APP_LOCALE__: JSON.stringify(env.APP_LOCALE ?? "en"),
    },
  };
});
