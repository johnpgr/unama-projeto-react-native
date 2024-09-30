import { createTRPCRouter } from "../trpc.ts"
import { authRouter } from "./auth.ts"
import { transactionRouter } from "./transaction.ts"

export const appRouter = createTRPCRouter({
    auth: authRouter,
    transaction: transactionRouter
})
