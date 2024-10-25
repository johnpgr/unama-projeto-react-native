import { PGlite } from "@electric-sql/pglite"
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres"
import { drizzle as drizzlePgLite } from "drizzle-orm/pglite"
import pg from "pg"

import { env } from "../src/env.ts"
import * as schema from "./schema.ts"

const connection =
  env.DATABASE_URL
    ? new pg.Pool({ connectionString: env.DATABASE_URL })
    : new PGlite("./database/pg-data/")

export const db =
  connection instanceof PGlite
    ? drizzlePgLite(connection, { schema })
    : drizzlePg(connection, { schema })
