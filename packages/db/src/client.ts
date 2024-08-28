import {drizzle} from "drizzle-orm/libsql"
import {createClient} from "@libsql/client"
import * as schema from "./schema"

export const db = drizzle(createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_TOKEN!,
}), { schema })
