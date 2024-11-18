import type { Config } from "drizzle-kit"

import { env } from "./src/config/env.ts"

export default {
  schema: "./src/drizzle/schema.ts",
  casing: "snake_case",
  out: "./src/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: { url: env.DATABASE_URL },
} satisfies Config
