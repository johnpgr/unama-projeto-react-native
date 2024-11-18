/* eslint-disable @typescript-eslint/no-floating-promises */
import http from "node:http"
import { incomingMessageToRequest } from "@trpc/server/adapters/node-http"
import { createHTTPHandler } from "@trpc/server/adapters/standalone"
import { applyWSSHandler } from "@trpc/server/adapters/ws"
import cors from "cors"
import * as ws from "ws"

import { createContext, createTRPCRouter } from "./trpc/index.ts"
import { authRouter } from "./features/auth/auth.routes.ts"
import { handleOAuthRequest } from "./features/auth/oauth/oauth.routes.ts"
import { transactionRouter } from "./features/transaction/transaction.routes.ts"
import { env } from "./config/env.ts"
import { renderTrpcPanel } from "trpc-ui"

export type AppRouter = typeof appRouter
export const appRouter = createTRPCRouter({
  auth: authRouter,
  transaction: transactionRouter,
})

const handleTRPCRequest = createHTTPHandler({
  middleware: cors(),
  router: appRouter,
  createContext,
})

const httpServer = http.createServer((req, res) => {
  const request = incomingMessageToRequest(req, { maxBodySize: 20_000 })
  const url = new URL(request.url)
  console.log(`󱓞 ${request.method} ${url.pathname}`)

  if (env.NODE_ENV === "development" && url.pathname === "/panel") {
    res.writeHead(200, { "content-type": "text/html" })
    res.end(
      renderTrpcPanel(appRouter, {
        url: "http://localhost:3000/",
        transformer: "superjson",
      }),
    )
  } else if (url.pathname.startsWith("/oauth")) {
    handleOAuthRequest(url, request, res).catch((e) => {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Internal Server Error" }))
      console.error("OAuth Request Error:", e)
    })
  } else {
    handleTRPCRequest(req, res).catch((e) => {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Internal Server Error" }))
      console.error("TRPC Request Error:", e)
    })
  }
})

const wss = new ws.WebSocketServer({ server: httpServer })

applyWSSHandler<AppRouter>({
  onError: (e) => console.error("WebSocket error", e),
  wss,
  router: appRouter,
  createContext,
})

httpServer.listen(3000)

console.info("  ECOPoints API Server Started")
console.info("➡️  Listening on http://0.0.0.0:3000")
console.info("➡️  Listening on ws://0.0.0.0:3000")
