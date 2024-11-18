import { fileURLToPath } from "node:url"
import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"

import { env } from "../config/env.ts"
import * as schema from "./schema.ts"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const getOptions = (): postgres.Options<{}> =>
  env.NODE_ENV === "production" ? { ssl: "require" } : {}

export const db = drizzle(postgres(env.DATABASE_URL, getOptions()), {
  schema,
  casing: "snake_case",
})

const migrationsFolder = fileURLToPath(
  new URL("./migrations/", import.meta.url),
)

await migrate(
  drizzle(
    postgres(env.DATABASE_URL, {
      ...getOptions(),
      max: 1,
    }),
  ),
  { migrationsFolder },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
).catch((_error) => {})
