import "./env.ts"
import "@total-typescript/ts-reset"

import { serve } from "@hono/node-server"
import { trpcServer } from "@hono/trpc-server"
import { Hono } from "hono"

import { createTRPCContext } from "./trpc/index.ts"
import { appRouter } from "./trpc/router/root.ts"

const app = new Hono()

app.use(
    "/trpc/*",
    trpcServer({ router: appRouter, createContext: createTRPCContext }),
)

serve(app, (i) => {
    console.log(`API Server listening at: http://${i.address}:${i.port}`)
})
