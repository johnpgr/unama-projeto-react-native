import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createWSClient,
  httpBatchLink,
  loggerLink,
  splitLink,
  unstable_httpSubscriptionLink,
  wsLink,
} from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"
import { ReadableStream, TransformStream } from "web-streams-polyfill"

import type { AppRouter } from "@projeto/api"

import { getBaseUrl } from "./base-url"
import { getToken } from "./session-store"

import "@azure/core-asynciterator-polyfill"

import { RNEventSource } from "rn-eventsource-reborn"

globalThis.ReadableStream = globalThis.ReadableStream || ReadableStream
globalThis.TransformStream = globalThis.TransformStream || TransformStream

//function getWSUrl(): string {
//  if (process.env.NODE_ENV === "production") {
//    TODO("Production WS URL")
//  }
//  return "ws://localhost:3000/trpc"
//}
//
//const wsClient = createWSClient({
//  url: getWSUrl(),
//  lazy: {
//    enabled: true,
//    closeMs: 0,
//  },
//  connectionParams() {
//    const token = getToken()
//    if (token) {
//      return { token }
//    }
//    return {}
//  },
//})

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
          true: unstable_httpSubscriptionLink({
            transformer: superjson,
            url: `/${getBaseUrl()}/trpc`,

            eventSourceOptions: () => {
              const headers = new Map<string, string>()
              headers.set("x-trpc-source", "expo-react")

              const token = getToken()
              if (token) headers.set("Authorization", `Bearer ${token}`)

              return {
                headers: Object.fromEntries(headers),
              }
            },
          }),
          false: httpBatchLink({
            transformer: superjson,
            url: `${getBaseUrl()}/trpc`,
            headers() {
              const headers = new Map<string, string>()
              headers.set("x-trpc-source", "expo-react")

              const token = getToken()
              if (token) headers.set("Authorization", `Bearer ${token}`)

              return Object.fromEntries(headers)
            },
          }),
        }),
      ],
    }),
  )

  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  )
}
