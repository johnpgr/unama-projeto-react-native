import { z } from "zod"

const envVariables = z.object({
    DATABASE_URL: z.string().min(1),
    AUTH_DISCORD_ID: z.string().min(1),
    AUTH_DISCORD_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    NODE_ENV: z.enum(["development", "production"]).optional(),
})

envVariables.parse(process.env)

declare global {
    namespace NodeJS {
        //@ts-expect-error ok
        interface ProcessEnv extends z.infer<typeof envVariables> {}
    }
}
