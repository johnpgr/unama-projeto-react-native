import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createWSClient,
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpBatchStreamLink,
  wsLink,
} from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"

import type { AppRouter } from "@projeto/api"

import { getBaseUrl, getWSUrl } from "./base-url"
import { getToken } from "./session-store"

const wsClient = createWSClient({
  url: getWSUrl(),
  retryDelayMs: () => 1_000,
  lazy: {
    enabled: true,
    closeMs: 0,
  },

  connectionParams() {
    const token = getToken()
    if (token) {
      return { token }
    }
    return {}
  },
})

/**
 * A set of typesafe hooks for consuming your API.
 */
export const api = createTRPCReact<AppRouter>()
export type { RouterInputs, RouterOutputs } from "@projeto/api"

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
export function TRPCProvider(props: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
          colorMode: "ansi",
        }),
        splitLink({
          condition: (op) => op.type === "subscription",
          true: wsLink({
            client: wsClient,
            transformer: superjson,
          }),
          false: httpBatchLink({
            transformer: superjson,
            url: getBaseUrl(),
            headers() {
              const token = getToken()

              if (token) {
                return { Authorization: `Bearer ${token}` }
              }

              return {}
            },
          }),
        }),
      ],
    }),
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
    </api.Provider>
  )
}
