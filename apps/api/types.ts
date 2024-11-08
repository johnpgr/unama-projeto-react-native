import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import type { appRouter } from "./src/router.ts"

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 **/
export type RouterInputs = inferRouterInputs<AppRouter>

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>

export type { TransactionType } from "./src/transaction/transaction.schema.ts"

export type * as schema from "./database/schema.ts"
