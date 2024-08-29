import {drizzle} from "drizzle-orm/libsql"
import {createClient} from "@libsql/client"
import * as schema from "./schema"

if (!process.env.TURSO_DB_URL) {
    throw new Error("Missing TURSO_DB_URL")
}

if (!process.env.TURSO_DB_TOKEN) {
    throw new Error("Missing TURSO_DB_TOKEN")
}

export const db = drizzle(createClient({
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_DB_TOKEN,
}), { schema })
