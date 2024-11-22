import { ChatMistralAI } from "@langchain/mistralai"
import { TRPCError } from "@trpc/server"
import { observable } from "@trpc/server/observable"
import { asc, desc, eq, inArray, or, sql } from "drizzle-orm"
import { z } from "zod"

import type { PubSubEvents } from "../../redis/index.ts"
import { env } from "../../config/env.ts"
import { db } from "../../drizzle/index.ts"
import {
  P2PTransaction,
  RecyclingTransaction,
  Reward,
  User,
  UserRewards,
} from "../../drizzle/schema.ts"
import { redis } from "../../redis/index.ts"
import { protectedProcedure, publicProcedure } from "../../trpc/index.ts"

export const transactionRouter = {
  getLLMResponse: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const llm = new ChatMistralAI({
        apiKey: env.MISTRAL_API_KEY,
        temperature: 0.5,
      })

      // TODO: Sanitize the input against LLM prompt injection
      const response = await llm.invoke(input.prompt)

      return { response: response.content }
    }),

  /**
   * Procedimento para adicionar uma transação de reciclagem.
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
  addRecyclingTransaction: protectedProcedure
    .input(
      z.object({
        weight: z.number(),
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
   * Procedimento para adicionar dinheiro a uma cooperativa e converter em pontos.
   *
   * Este procedimento permite que uma cooperativa adicione dinheiro e receba pontos em troca.
   * Verifica se o usuário é uma cooperativa e calcula os pontos ganhos com base na quantidade de dinheiro adicionada.
   *
   * Parâmetros de entrada:
   * - amount: A quantidade de dinheiro a ser adicionada.
   *
   * Retorna:
   * - Um objeto contendo:
   *   - success: Indica se a operação foi bem-sucedida.
   *   - pointsEarned: A quantidade de pontos ganhos.
   *
   * Lança:
   * - Error: Se o usuário não for uma cooperativa.
   */
  addMoneyToCooperative: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.userType !== "cooperative") {
        throw new Error("Apenas cooperativas podem enviar dinheiro para ganhar pontos.")
      }
      const pointsEarned = input.amount * 20
      await db
        .update(User)
        .set({
          totalPoints: sql`${User.totalPoints} + ${pointsEarned}`,
        })
        .where(eq(User.id, ctx.user.id))
      return { success: true, pointsEarned }
    }),

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
  sendPointsP2P: protectedProcedure
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

  getAvailableRewards: publicProcedure.query(async () => {
    return await db.query.Reward.findMany({
      orderBy: (reward) => asc(reward.points),
    })
  }),

  getUserRewards: protectedProcedure.query(async ({ ctx }) => {
    return await db.query.UserRewards.findMany({
      where: (userRewards) => eq(userRewards.userId, ctx.user.id),
      with: { reward: { columns: { points: true } } },
    })
  }),

  getUserExtract: protectedProcedure.query(async ({ ctx }) => {
    const extract = await db.query.User.findFirst({
      where: (user) => eq(user.id, ctx.user.id),
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
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Usuário não encontrado",
      })
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

    const groupped = Object.groupBy(asList, (item) => item.createdAt.toLocaleDateString())

    return groupped
  }),

  exchangePointsForReward: protectedProcedure
    .input(
      z.object({
        rewardId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const reward = await db.query.Reward.findFirst({
        where: (reward) => eq(reward.id, input.rewardId),
      })

      if (!reward) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Recompensa não encontrada",
        })
      }

      const userPoints = ctx.user.totalPoints

      if (userPoints < reward.points) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Pontos insuficientes para esta recompensa",
        })
      }

      await db
        .update(User)
        .set({
          totalPoints: sql<number>`${User.totalPoints} - ${reward.points}`,
        })
        .where(eq(User.id, ctx.user.id))

      await db.insert(UserRewards).values({
        rewardId: reward.id,
        userId: ctx.user.id,
      })

      return {
        success: true,
        rewardName: reward.reward,
        pointsSpent: reward.points,
        remainingPoints: userPoints - reward.points,
      }
    }),
  createReward: protectedProcedure
    .input(
      z.object({
        rewardName: z.string(),
        points: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.userType !== "admin") {
        throw new Error("Apenas administradores podem criar recompensas.")
      }
      await db.insert(Reward).values({
        reward: input.rewardName,
        points: input.points,
      })
    }),
}
