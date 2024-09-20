import type { Config } from "drizzle-kit"
import { DATABASE_TYPE } from "./src/drizzle/client"

export default {
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle/migrations",
    dialect: "postgresql",
    ...{
        driver: DATABASE_TYPE === "pg_default"
            ? undefined
            : "pglite",
    },
    dbCredentials: { url: process.env.DATABASE_URL },
} satisfies Config
