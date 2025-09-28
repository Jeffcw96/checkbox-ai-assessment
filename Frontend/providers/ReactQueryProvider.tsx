"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

// Create a singleton QueryClient (adjust GC/stale times as needed)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // required: disable window focus refetch
      retry: 1,
      staleTime: 5 * 60 * 1000, // mirrors previous hook setting
    },
    mutations: {
      retry: 1,
    },
  },
});

export const ReactQueryProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Optional helper if you ever need direct access (e.g., imperative invalidation)
export function getQueryClient() {
  return queryClient;
}
