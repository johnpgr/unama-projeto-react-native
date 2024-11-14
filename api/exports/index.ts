import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"

import type { AppRouter } from "../src/index.ts"

// export type definition of API
export type { AppRouter } from "../src/index.ts"

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

//Export the drizzle schema
export type * from "../drizzle/schema.ts"

//Export the auth validation
export * from "../src/auth/auth.validation.ts"
