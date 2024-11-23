import { sql } from "drizzle-orm"

import { db } from "../../drizzle/index.ts"
import { redis } from "../../redis/index.ts"
import { publicProcedure } from "../../trpc/index.ts"

export const healthRouter = {
  check: publicProcedure.query(async () => {
    return {
      uptime: process.uptime(),
      services: {
        redis: await getRedisStatus(),
        db: await getDatabaseStatus(),
      },
    }
  }),
}

export async function getRedisStatus() {
  const start = performance.now()
  const client = await redis.getClient()
  const redisPing = await client.ping()

  const end = performance.now()

  const isRedisHealthy = redisPing === "PONG"

  return {
    latency: end - start,
    online: isRedisHealthy,
  }
}

export async function getDatabaseStatus() {
  const start = performance.now()

  const databasePing = await db.execute(sql`select 1 = 1`)
  console.dir(databasePing, { depth: Infinity })

  const end = performance.now()

  // @ts-expect-error this is ok
  const isDatabaseHealthy = Object.values(databasePing[0])[0] === true

  return {
    latency: end - start,
    online: isDatabaseHealthy,
  }
}
