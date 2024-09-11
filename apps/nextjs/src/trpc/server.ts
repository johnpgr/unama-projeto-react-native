import { cache } from "react"
import { headers } from "next/headers"
import { createHydrationHelpers } from "@trpc/react-query/rsc"

import type { AppRouter } from "@projeto/api"
import { createCaller, createTRPCContext } from "@projeto/api"
import { auth } from "@projeto/auth"

import { createQueryClient } from "./common"

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
    const heads = new Headers(headers())
    heads.set("x-trpc-source", "rsc")

    return createTRPCContext({
        session: await auth(),
        headers: heads,
    })
})

const getQueryClient = cache(createQueryClient)
const caller = createCaller(createContext)

export const { trpc: Api, HydrateClient } = createHydrationHelpers<AppRouter>(
    caller,
    getQueryClient,
)
