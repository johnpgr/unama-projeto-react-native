import { TRPCError } from "@trpc/server"
import { eq, inArray, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../database/client.ts"
import { recyclingTransactions, User } from "../../database/schema.ts"
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
            await db.insert(recyclingTransactions).values({
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
    getUserPoints: protectedProcedure.query(async ({ ctx }) => {
        const user = await db.query.User.findFirst({
            where: (user) => eq(user.id, ctx.session.userId),
        })

        return {
            points: user?.totalPoints || 0,
            canRedeemRewards: user?.canRedeemRewards,
        }
    }),

    sendPointsP2P: protectedProcedure
        .input(
            z.object({
                receiverId: z.string(),
                amountPoints: z.number(),
            }),
        )

        .mutation(async ({ ctx, input }) => {
            if (!input.amountPoints) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "O valor inserido não é válido",
                })
            }

            const userID = ctx.session.userId

            const sender = await db.query.User.findFirst({
                where: (user) => eq(user.id, userID),
            })

            if (!sender) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Usuário não está logado",
                })
            }
            const receiver = await db.query.User.findFirst({
                where: (user) => eq(user.id, input.receiverId),
            })
            if (!receiver) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "O código inserido não pertence a nenhuma conta",
                })
            }
            const senderPoints = sender.totalPoints ?? 0
            if (senderPoints < input.amountPoints) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "O saldo é insuficiente",
                })
            }

            await db
                .update(User)
                .set({
                    totalPoints: sql<number>`
            CASE 
                WHEN ${User.id} = ${userID} THEN COALESCE(${User.totalPoints}, 0) - ${input.amountPoints}
                WHEN ${User.id} = ${input.receiverId} THEN COALESCE(${User.totalPoints}, 0) + ${input.amountPoints}
            END
        `,
                })
                .where(inArray(User.id, [userID, input.receiverId]))

            return {
                success: true,
                senderId: sender.id,
                senderFullName: sender.fullName,
                receiverId: receiver.id,
                receiverFullName: receiver.fullName,
                pointsTransferred: input.amountPoints,
            }
        }),
}
