import type { Config } from "drizzle-kit"

if (!process.env.TURSO_DB_URL) {
    throw new Error("Missing TURSO_DB_URL")
}

if (!process.env.TURSO_DB_TOKEN) {
    throw new Error("Missing TURSO_DB_TOKEN")
}

const url = process.env.TURSO_DB_URL
const authToken = process.env.TURSO_DB_TOKEN

export default {
    schema: "./src/schema.ts",
    out: "./migrations",
    dialect: "sqlite",
    driver: "turso",
    dbCredentials: { url, authToken },
} satisfies Config
