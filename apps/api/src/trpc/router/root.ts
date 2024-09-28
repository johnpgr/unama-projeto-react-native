import { createTRPCRouter } from "../trpc.ts"
import { authRouter } from "./auth.ts"

export const appRouter = createTRPCRouter({
    auth: authRouter,
})
