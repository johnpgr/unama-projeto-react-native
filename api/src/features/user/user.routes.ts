import { TRPCError } from "@trpc/server"
import { desc, eq, or } from "drizzle-orm"

import { db } from "../../drizzle/index.ts"
import { protectedProcedure } from "../../trpc/index.ts"
import { getUserExtract } from "./user.queries.ts"

export const userRouter = {
  /**
   * Procedimento para obter as transações do usuário.
   *
   * Este procedimento recupera todas as transações de pontos enviadas e recebidas pelo usuário atual.
   *
   * Retorna:
   * - Um array de objetos contendo:
   *   - id: O ID da transação.
   *   - points: A quantidade de pontos transferidos.
   *   - transactionDate: A data da transação.
   *   - from: O código do usuário que enviou os pontos.
   *   - to: O código do usuário que recebeu os pontos.
   */
  getUserTransactions: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await db.query.P2PTransaction.findMany({
      where: (transaction) =>
        or(eq(transaction.from, ctx.user.id), eq(transaction.to, ctx.user.id)),
    })

    const formattedTransactions = transactions.map((transaction) => ({
      ...transaction,
      points: transaction.from === ctx.user.id ? -transaction.points : transaction.points,
    }))

    return formattedTransactions
  }),

  getUserRewards: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.UserRewards.findMany({
      where: (userRewards) => eq(userRewards.userId, ctx.user.id),
      with: { reward: { columns: { points: true } } },
    })
  }),

  getUserExtract: protectedProcedure.query(async ({ ctx }) => {
    const extract = await getUserExtract(ctx.user.id)
    const groupped = Object.groupBy(extract, (item) => item.createdAt.toLocaleDateString())

    return groupped
  }),
}
