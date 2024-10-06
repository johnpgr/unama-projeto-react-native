import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    REDIRECT_URL: z.string().url().optional(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    AUTH_APPLE_WEB_CLIENT_ID: z.string().optional(),
    AUTH_APPLE_TEAM_ID: z.string().optional(),
    AUTH_APPLE_KEY_ID: z.string().optional(),
    AUTH_APPLE_PRIVATE_KEY: z.string().optional(),
    NODE_ENV: z.enum(["development", "production"]).optional(),
  },
  runtimeEnv: process.env,
})
