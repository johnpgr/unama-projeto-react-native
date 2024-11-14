import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string(),
    REDIS_URL: z.string(),
    REDIS_PASSWORD: z.string().optional(),
    MISTRAL_API_KEY: z.string(),
    REDIRECT_URL: z.string().url(),
    AUTH_GOOGLE_ID: z.string(),
    AUTH_GOOGLE_SECRET: z.string(),
    AUTH_GITHUB_ID: z.string(),
    AUTH_GITHUB_SECRET: z.string(),
    AUTH_APPLE_WEB_CLIENT_ID: z.string().optional(),
    AUTH_APPLE_TEAM_ID: z.string().optional(),
    AUTH_APPLE_KEY_ID: z.string().optional(),
    AUTH_APPLE_PRIVATE_KEY: z.string().optional(),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
  },
  runtimeEnv: process.env,
})
