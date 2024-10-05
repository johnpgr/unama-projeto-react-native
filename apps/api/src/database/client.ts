import { PGlite } from "@electric-sql/pglite"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import { drizzle as drizzlePgLite } from "drizzle-orm/pglite"
import pg from "pg"

import * as schema from "./schema.ts"

export const DATABASE_TYPE = process.env.DATABASE_URL.startsWith(
  "postgresql://",
)
  ? "pg_default"
  : process.env.DATABASE_URL.startsWith("./")
    ? "pglite_file"
    : "pglite_memory"

const conn =
  DATABASE_TYPE === "pg_default"
    ? new pg.Pool({
        max: 10,
        connectionString: process.env.DATABASE_URL,
      })
    : new PGlite(process.env.DATABASE_URL)

export const db =
  conn instanceof PGlite
    ? drizzlePgLite(conn, { schema })
    : drizzlePg(conn, { schema })
