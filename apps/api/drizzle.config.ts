import type { Config } from "drizzle-kit"

import { env } from "./src/env.ts"

export default {
  schema: "./database/schema.ts",
  out: "./database/migrations",
  dialect: "postgresql",
  ...(env.DATABASE_URL
    ? {}
    : {
        driver: "pglite",
      }),
  dbCredentials: env.DATABASE_URL
    ? { url: env.DATABASE_URL }
    : { url: "./database/pg-data/" },
} satisfies Config
