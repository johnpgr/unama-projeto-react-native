import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "../config/env.ts"
import * as schema from "./schema.ts"

export const db = drizzle(postgres(env.DATABASE_URL), {
  schema,
  casing: "snake_case",
})
