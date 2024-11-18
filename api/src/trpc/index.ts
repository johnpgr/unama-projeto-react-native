import type { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone"
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws"
import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { ZodError } from "zod"

import { InvalidSessionError } from "../features/auth/auth.error.ts"
import { sessionService } from "../features/auth/auth.session.ts"

type NonNullableObj<T> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export async function createContext(
  data: CreateHTTPContextOptions | CreateWSSContextFnOptions,
) {
  const bearerToken =
    data.req.headers.authorization?.split(" ")[1] ??
    data.info.connectionParams?.token

  if (!bearerToken) {
    return { session: null, user: null }
  }

  const session = await sessionService.validateSessionToken(bearerToken)

  if (session instanceof InvalidSessionError) {
    return { session: null, user: null }
  }

  return session
}

type Context = Awaited<ReturnType<typeof createContext>>

/**
 * 2. INITIALIZATION
 *
 * This is where the trpc api is initialized, connecting the context and
 * transformer
 */
const t = initTRPC.context<typeof createContext>().create({
  transformer: superjson,
  errorFormatter: ({ shape, error }) => ({
    ...shape,
    data: {
      ...shape.data,
      zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
    },
  }),
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder
 */

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Middleware for timing procedure execution and adding an articifial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now()

  const result = await next()

  const end = Date.now()
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`)

  return result
})

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure.use(timingMiddleware)

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }
    return next({
      ctx: ctx as NonNullableObj<Context>,
    })
  })

/**
 * Protected procedure that ensures the user is authenticated and has admin privileges.
 * This procedure combines timing middleware with admin authorization checks.
 *
 * @throws {TRPCError} With code "UNAUTHORIZED" if the user is not logged in or is not an admin
 */
export const adminProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session || ctx.user.userType !== "admin") {
      throw new TRPCError({ code: "UNAUTHORIZED" })
    }
    return next({
      ctx: ctx as NonNullableObj<Context>,
    })
  })
