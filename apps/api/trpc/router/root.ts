import { createTRPCRouter } from "../index.ts"
import { authRouter } from "./auth.ts"

export const appRouter = createTRPCRouter({
    auth: authRouter,
})
