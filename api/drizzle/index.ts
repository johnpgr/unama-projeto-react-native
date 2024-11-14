import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import { env } from "../config/env.ts"
import * as schema from "./schema.ts"

function getOptions() {
  if (env.NODE_ENV === "production") {
    return { ssl: "require" as const }
  }

  return undefined
}

const queryClient = postgres(env.DATABASE_URL, getOptions())

export const db = drizzle(queryClient, { schema, casing: "snake_case" })
