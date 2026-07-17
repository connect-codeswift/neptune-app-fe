"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { getQueryClient } from "@/lib/query-client";

export type QueryProviderProps = Readonly<{
  children: ReactNode;
}>;

export function QueryProvider(props: Readonly<QueryProviderProps>) {
  const { children } = props;
  const [queryClient] = useState(getQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools
          buttonPosition="bottom-left"
          initialIsOpen={false}
        />
      ) : null}
    </QueryClientProvider>
  );
}
