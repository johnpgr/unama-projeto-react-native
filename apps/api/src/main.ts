import "./env.ts"

import { serve } from "@hono/node-server"
import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import type { AppContext } from "./context.ts"
import { AuthController } from "./auth/auth.routes.hono.ts"
import { AuthMiddleware } from "./auth/auth.middleware.ts"
import { appRouter } from "./router.ts" 
import { createTRPCContext } from "./trpc.ts" 

const app = new Hono<AppContext>()
  .use(logger())
  .use((c, next) => {
    const handler = cors({
      origin: process.env.API_URL ?? "http://localhost:3000",
    })
    return handler(c, next)
  })
  .use(AuthMiddleware)
  .use(
    "/trpc/*",
    trpcServer({ router: appRouter, createContext: createTRPCContext }),
  )
  .route("/auth", AuthController)

serve(app, ({ address, port }) => {
  console.log(`API Server listening at: http://${address}:${port}`)
})
