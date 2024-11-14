import type { Config } from "drizzle-kit"

import { env } from "./config/env.ts"

export default {
  schema: "./database/schema.ts",
  casing: "snake_case",
  out: "./database/migrations",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
} satisfies Config
