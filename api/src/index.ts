import http from "node:http"
import { createHTTPHandler } from "@trpc/server/adapters/standalone"
import { applyWSSHandler } from "@trpc/server/adapters/ws"
import cors from "cors"
import { renderTrpcPanel } from "trpc-ui"
import * as ws from "ws"

import { env } from "./config/env.ts"
import { authRouter } from "./features/auth/auth.routes.ts"
import { handleOAuthRequest } from "./features/auth/oauth/oauth.routes.ts"
import { chatRouter } from "./features/chat/chat.routes.ts"
import { healthRouter } from "./features/health/health.routes.ts"
import { notificationRouter } from "./features/notification/notification.routes.ts"
import { pointsRouter } from "./features/points/points.routes.ts"
import { rewardRouter } from "./features/reward/reward.routes.ts"
import { transactionRouter } from "./features/transaction/transaction.routes.ts"
import { userRouter } from "./features/user/user.routes.ts"
import { createContext, createTRPCRouter } from "./trpc/index.ts"

export const appRouter = createTRPCRouter({
  health: healthRouter,
  auth: authRouter,
  user: userRouter,
  transaction: transactionRouter,
  chat: chatRouter,
  points: pointsRouter,
  notification: notificationRouter,
  reward: rewardRouter,
})

export type AppRouter = typeof appRouter

const handleTRPCRequest = createHTTPHandler({
  middleware: cors(),
  router: appRouter,
  createContext,
})

const httpServer = http.createServer((req, res) => {
  if (!req.url) {
    throw new Error("Request URL is undefined")
  }

  console.log(`󱓞 ${req.method} ${req.url}`)

  if (env.NODE_ENV === "development" && req.url === "/trpc.panel") {
    res.writeHead(200, { "content-type": "text/html" })
    res.end(
      renderTrpcPanel(appRouter, {
        url: "http://localhost:3000/",
        transformer: "superjson",
      }),
    )
  } else if (req.url.startsWith("/oauth")) {
    handleOAuthRequest(req, res).catch((e) => {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Internal Server Error" }))
      console.error("OAuth Request Error:", (e as Error).message)
    })
  } else {
    handleTRPCRequest(req, res)
  }
})

const wss = new ws.WebSocketServer({ server: httpServer })

applyWSSHandler<AppRouter>({
  onError: (e) => console.error("WebSocket error", e.error.message),
  wss,
  router: appRouter,
  createContext,
})

httpServer.listen(3000)

console.info("  ECOPoints API Server Started")
console.info("➡️  Listening on http://0.0.0.0:3000")
console.info("➡️  Listening on ws://0.0.0.0:3000")
