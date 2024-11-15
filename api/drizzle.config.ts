import type { Config } from "drizzle-kit"

import { env } from "./config/env.ts"

export default {
  schema: "./drizzle/schema.ts",
  casing: "snake_case",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
} satisfies Config
