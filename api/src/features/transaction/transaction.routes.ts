import { TRPCError } from "@trpc/server"
import { observable } from "@trpc/server/observable"
import { eq, inArray, sql } from "drizzle-orm"
import { z } from "zod"

import type { PubSubEvents } from "../../redis/index.ts"
import { db } from "../../drizzle/index.ts"
import { P2PTransaction, RecyclingTransaction, User } from "../../drizzle/schema.ts"
import { redis } from "../../redis/index.ts"
import { protectedProcedure } from "../../trpc/index.ts"

export const transactionRouter = {
  /**
   * Procedimento para criar uma transação de reciclagem.
   *
   * Este procedimento permite que um usuário normal adicione uma transação de reciclagem,
   * calculando os pontos ganhos com base no peso dos materiais reciclados.
   *
   * Parâmetros de entrada:
   * - weight: O peso dos materiais reciclados.
   *
   * Retorna:
   * - Nenhum valor de retorno explícito.
   *
   * Lança:
   * - Error: Se o usuário não for um usuário normal.
   */
  createRecyclingTransaction: protectedProcedure
    .input(
      z.object({
        weight: z.number(),
        material: z.enum(["plastic", "glass", "metal", "paper", "electronic"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.userType !== "normal") {
        throw new Error("Apenas usuários normais podem enviar pontos.")
      }

      const pointsEarned = input.weight * 10

      await db.insert(RecyclingTransaction).values({
        userId: ctx.user.id,
        weight: input.weight,
        material: input.material,
        points: pointsEarned,
      })

      await db
        .update(User)
        .set({
          totalPoints: sql`${User.totalPoints} + ${pointsEarned}`,
        })
        .where(eq(User.id, ctx.user.id))
    }),

  /**
   * Procedimento para enviar pontos de um usuário para outro (P2P).
   *
   * Este procedimento permite que um usuário envie pontos para outro usuário,
   * verificando se ambos os usuários existem, se o remetente tem pontos suficientes,
   * e se o valor dos pontos é válido. Também impede que um usuário envie pontos para si mesmo.
   *
   * Parâmetros de entrada:
   * - receiverId: O ID do receptor dos pontos.
   * - amountPoints: A quantidade de pontos a ser transferida.
   *
   * Retorna:
   * - Um objeto contendo:
   *   - success: Indica se a transferência foi bem-sucedida.
   *   - senderId: O ID do remetente.
   *   - senderFullName: O nome completo do remetente.
   *   - receiverId: O ID do receptor.
   *   - receiverFullName: O nome completo do receptor.
   *   - pointsTransferred: A quantidade de pontos transferidos.
   *
   * Lança:
   * - TRPCError: Se o usuário não estiver logado, se o receptor não existir,
   *   se o valor dos pontos for inválido, se o saldo for insuficiente,
   *   ou se o usuário tentar enviar pontos para si mesmo.
   */
  createP2PTransaction: protectedProcedure
    .input(
      z.object({
        receiverId: z.string().min(1, "ID do receptor é obrigatório"),
        amountPoints: z.number().positive("O valor inserido não é válido"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const sender = ctx.user
      const receiver = await db.query.User.findFirst({
        where: (user) => eq(user.id, input.receiverId),
      })

      if (!receiver) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário receptor não encontrado",
        })
      }

      const senderUserType = ctx.user.userType
      const receiverUserType = receiver.userType

      if (
        !(senderUserType === "normal" && receiverUserType === "normal") &&
        senderUserType !== "admin" &&
        receiverUserType !== "admin"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Apenas usuários normais podem enviar pontos.",
        })
      }

      if (input.amountPoints <= 0) {
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "O valor inserido não é válido",
        })
      }

      const senderPoints = sender.totalPoints
      if (senderPoints < input.amountPoints) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "O saldo é insuficiente",
        })
      }

      if (input.receiverId == sender.id) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Você não pode mandar pontos a si mesmo",
        })
      }

      await db.transaction(async (t) => {
        await t
          .update(User)
          .set({
            totalPoints: sql<number>`
            CASE
                WHEN ${User.id} = ${sender.id} THEN 
                  COALESCE(${User.totalPoints}, 0) - ${input.amountPoints}
                WHEN ${User.id} = ${input.receiverId} THEN 
                  COALESCE(${User.totalPoints}, 0) + ${input.amountPoints}
            END`,
          })
          .where(inArray(User.id, [sender.id, input.receiverId]))

        const [transaction] = await t
          .insert(P2PTransaction)
          .values({
            from: sender.id,
            to: input.receiverId,
            points: input.amountPoints,
          })
          .returning()

        if (!transaction) return

        await redis.publish("sendPointsP2P", {
          id: transaction.id,
          pointsTransferred: input.amountPoints,
          senderId: transaction.from,
          receiverId: transaction.to,
        })
      })

      return {
        senderId: sender.id,
        senderFullName: sender.fullName,
        receiverId: receiver.id,
        receiverFullName: receiver.fullName,
        pointsTransferred: input.amountPoints,
      }
    }),

  onP2PTransaction: protectedProcedure.subscription(({ ctx }) => {
    return observable<Parameters<PubSubEvents["sendPointsP2P"]>[0]>((emit) => {
      void redis.subscribe("sendPointsP2P", (transaction) => {
        if (ctx.user.id === transaction.receiverId) {
          emit.next(transaction)
        }
      })

      return () => {
        void redis.unsubscribe("sendPointsP2P")
      }
    })
  }),
}
