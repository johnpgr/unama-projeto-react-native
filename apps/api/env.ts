import { z } from "zod"

const envVariables = z.object({
    API_URL: z.string().url(),
    DATABASE_URL: z.string().min(1),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
})

envVariables.parse(process.env)

declare global {
    namespace NodeJS {
        interface ProcessEnv extends z.infer<typeof envVariables> {}
    }
}
