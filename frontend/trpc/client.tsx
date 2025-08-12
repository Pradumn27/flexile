"use client";
import { type QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { type AppRouter } from "./server";
import { createClient } from "./shared";

export const trpc = createTRPCReact<AppRouter>();

let queryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    return createClient();
  }
  return (queryClient ??= createClient());
}

function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3001";
  })();
  return `${base}/trpc`;
}

export function TRPCProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: getUrl(), transformer: superjson })],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

export * from "@/db/enums";
