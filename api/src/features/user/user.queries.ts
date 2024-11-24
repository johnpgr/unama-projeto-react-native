import { desc, eq } from "drizzle-orm"

import { db } from "../../drizzle/index.ts"

export async function getUserExtract(userId: string) {
  const extract = await db.query.User.findFirst({
    where: (user) => eq(user.id, userId),
    columns: {},
    with: {
      //prettier-ignore
      recyclingTransactions: { orderBy: (recycling) => desc(recycling.createdAt) },
      rewards: { orderBy: (reward) => desc(reward.createdAt) },
      p2pTransactionsFrom: { orderBy: (p2p) => desc(p2p.createdAt) },
      p2pTransactionsTo: { orderBy: (p2p) => desc(p2p.createdAt) },
    },
  })

  if (!extract) {
    return []
  }

  const asList = [
    ...extract.p2pTransactionsFrom.map(
      (transaction) =>
        ({
          ...transaction,
          type: "p2pFrom",
        }) as const,
    ),
    ...extract.p2pTransactionsTo.map(
      (transaction) =>
        ({
          ...transaction,
          type: "p2pTo",
        }) as const,
    ),
    ...extract.recyclingTransactions.map(
      (transaction) =>
        ({
          ...transaction,
          type: "recycling",
        }) as const,
    ),
    ...extract.rewards.map(
      (transaction) =>
        ({
          ...transaction,
          type: "reward",
        }) as const,
    ),
  ]

  return asList
}
