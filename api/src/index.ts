/* eslint-disable @typescript-eslint/no-floating-promises */
import http from "node:http"
import { incomingMessageToRequest } from "@trpc/server/adapters/node-http"
import { createHTTPHandler } from "@trpc/server/adapters/standalone"
import { applyWSSHandler } from "@trpc/server/adapters/ws"
import cors from "cors"
import * as ws from "ws"

import { createContext, createTRPCRouter } from "../trpc/index.ts"
import { authRouter } from "./auth/auth.routes.ts"
import { handleOAuthRequest } from "./auth/oauth/oauth.routes.ts"
import { transactionRouter } from "./transaction/transaction.routes.ts"

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
  console.log(`🚀 ${request.method} ${url.pathname}`)

  if (url.pathname.startsWith("/oauth")) {
    handleOAuthRequest(url, request, res).catch((err) => {
      console.error(err)
      res.statusCode = 500
      res.end("Internal Server Error")
    })
  } else {
    handleTRPCRequest(req, res)
  }
})

const wss = new ws.WebSocketServer({ server: httpServer })

applyWSSHandler<AppRouter>({
  onError: console.error,
  wss,
  router: appRouter,
  createContext,
})

httpServer.listen(3000)

console.info("🏁  ECOPoints API Server Started")
console.info("➡️  Listening on http://0.0.0.0:3000")
console.info("➡️  Listening on ws://0.0.0.0:3000")
