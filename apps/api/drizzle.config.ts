import type { Config } from "drizzle-kit"
import { DATABASE_TYPE } from "./src/database/client"

export default {
    schema: "./src/database/schema.ts",
    out: "./src/database/migrations",
    dialect: "postgresql",
    ...{
        driver: DATABASE_TYPE === "pg_default"
            ? undefined
            : "pglite",
    },
    dbCredentials: { url: process.env.DATABASE_URL },
} satisfies Config
