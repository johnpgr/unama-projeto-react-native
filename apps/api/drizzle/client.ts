import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"

import * as schema from "./schema.ts"

const pool = new pg.Pool({ max: 10, connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })
