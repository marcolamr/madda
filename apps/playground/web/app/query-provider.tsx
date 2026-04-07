"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            /**
             * Predefinição do TanStack é `online`: com `navigator.onLine === false` (comum em
             * Windows/Chrome mesmo com o servidor local a responder) as queries podem ficar em
             * pausa. Em localhost não queremos depender disso.
             */
            networkMode: "always",
          },
          mutations: {
            networkMode: "always",
          },
        },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
