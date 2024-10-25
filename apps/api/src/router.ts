import { createTRPCRouter } from "./trpc.ts" 
import { authRouter } from "./auth/auth.routes.ts"
import { transactionRouter } from "./transaction/transaction.routes.ts" 

export const appRouter = createTRPCRouter({
  auth: authRouter,
  transaction: transactionRouter,
})
