import { useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { httpBatchLink, loggerLink } from "@trpc/client"
import { createTRPCReact } from "@trpc/react-query"
import superjson from "superjson"

import type { AppRouter } from "@projeto/api"

import { getBaseUrl } from "./base-url"
import { getToken } from "./session-store"

/**
 * A set of typesafe hooks for consuming your API.
 */
export const Api = createTRPCReact<AppRouter>()
export { type RouterInputs, type RouterOutputs } from "@projeto/api"

/**
 * A wrapper for your app that provides the TRPC context.
 * Use only in _app.tsx
 */
export function TRPCProvider(props: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient())
    const [trpcClient] = useState(() =>
        Api.createClient({
            links: [
                loggerLink({
                    enabled: (opts) =>
                        process.env.NODE_ENV === "development" ||
                        (opts.direction === "down" &&
                            opts.result instanceof Error),
                    colorMode: "ansi",
                }),
                httpBatchLink({
                    transformer: superjson,
                    url: `${getBaseUrl()}/api/trpc`,
                    headers() {
                        const headers = new Map<string, string>()
                        headers.set("x-trpc-source", "expo-react")

                        const token = getToken()
                        if (token)
                            headers.set("Authorization", `Bearer ${token}`)

                        return Object.fromEntries(headers)
                    },
                }),
            ],
        }),
    )

    return (
        <Api.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {props.children}
            </QueryClientProvider>
        </Api.Provider>
    )
}
