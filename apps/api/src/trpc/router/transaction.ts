import { TRPCError } from "@trpc/server"
import { eq, inArray, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../database/client.ts"
import {
  P2PTransaction,
  RecyclingTransaction,
  User,
} from "../../database/schema.ts"
import { protectedProcedure, publicProcedure } from "../trpc.ts"

export const transactionRouter = {
  addRecyclingTransaction: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        weight: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await db.query.User.findFirst({
        where: (user) => eq(user.id, input.userId),
      })

      if (user?.userType !== "normal") {
        throw new Error("Apenas usuários normais podem enviar pontos.")
      }
      const pointsEarned = input.weight * 10
      await db.insert(RecyclingTransaction).values({
        userId: input.userId,
        weight: input.weight,
        points: pointsEarned,
      })

      await db
        .update(User)
        .set({
          totalPoints: sql`${User.totalPoints} + ${pointsEarned}`,
        })
        .where(eq(User.id, input.userId))
    }),

  addMoneyToCooperative: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const user = await db.query.User.findFirst({
        where: (user) => eq(user.id, input.userId),
      })

      if (user?.userType !== "cooperative") {
        throw new Error(
          "Apenas cooperativas podem enviar dinheiro para ganhar pontos.",
        )
      }
      const pointsEarned = input.amount * 20
      await db
        .update(User)
        .set({
          totalPoints: sql`${User.totalPoints} + ${pointsEarned}`,
        })
        .where(eq(User.id, input.userId))
      return { success: true, pointsEarned }
    }),

  // Consultar pontos de um usuário
  getUserInformations: protectedProcedure.query(async ({ ctx }) => {
    const user = await db.query.User.findFirst({
      where: (user) => eq(user.id, ctx.session.userId),
    })

    return {
      fullName: user?.fullName,
      email: user?.email,
      userCode: user?.userCode,
      userType: user?.userType,
      points: user?.totalPoints ?? 0,
      canRedeemRewards: user?.canRedeemRewards,
    }
  }),
  getUserTransactions: protectedProcedure.query(async ({ ctx }) => {
    const transaction_from = await db.query.P2PTransaction.findMany({
      where: (from) => eq(from.from, ctx.user.userCode),
    })
    const transaction_to = await db.query.P2PTransaction.findMany({
      where: (to) => eq(to.to, ctx.user.userCode),
    })
    transaction_from.map((num) => -num.points)
    transaction_to.map((num) => +num.points)
    const transactions: {
      id: number
      points: number
      transactionDate: string | null
      from: string
      to: string
    }[] = []
    transactions.push(...transaction_from)
    transactions.push(...transaction_to)
    return transactions
  }),

  sendPointsP2P: protectedProcedure
    .input(
      z.object({
        receiverId: z.string(),
        amountPoints: z.number(),
      }),
    )

    .mutation(async ({ ctx, input }) => {
      const userCode = ctx.user.userCode
      const sender = await db.query.User.findFirst({
        where: (user) => eq(user.userCode, userCode),
      })
      const receiver = await db.query.User.findFirst({
        where: (user) => eq(user.userCode, input.receiverId),
      })

      if (!sender) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não está logado",
        })
      }

      if (!receiver) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "O código inserido não pertence a nenhuma conta",
        })
      }

      const senderUserType = ctx.user.userType

      const receiverUserType = receiver.userType

      if (senderUserType === "normal" && receiverUserType === "normal") {
        if (input.amountPoints <= 0) {
          throw new TRPCError({
            code: "BAD_GATEWAY",
            message: "O valor inserido não é válido",
          })
        }

        const senderPoints = sender.totalPoints ?? 0
        if (senderPoints < input.amountPoints) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "O saldo é insuficienteee",
          })
        }
        if (input.receiverId == userCode) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Você não pode mandar pontos a si mesmo",
          })
        }

        await db
          .update(User)
          .set({
            totalPoints: sql<number>`
            CASE 
                WHEN ${User.userCode} = ${userCode} THEN COALESCE(${User.totalPoints}, 0) - ${input.amountPoints}
                WHEN ${User.userCode} = ${input.receiverId} THEN COALESCE(${User.totalPoints}, 0) + ${input.amountPoints}
            END
        `,
          })
          .where(inArray(User.userCode, [userCode, input.receiverId]))

        await db.insert(P2PTransaction).values({
          from: userCode,
          to: input.receiverId,
          points: -input.amountPoints,
        })

        return {
          success: true,
          senderId: sender.id,
          senderFullName: sender.fullName,
          receiverId: receiver.id,
          receiverFullName: receiver.fullName,
          pointsTransferred: input.amountPoints,
        }
      }
    }),
}
