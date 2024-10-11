import { ChatMistralAI } from "@langchain/mistralai"
import { TRPCError } from "@trpc/server"
import { eq, inArray, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../database/client.ts"
import {
  P2PTransaction,
  RecyclingTransaction,
  User,
} from "../../database/schema.ts"
import { protectedProcedure } from "../trpc.ts"

export const transactionRouter = {
  getLLMResponse: protectedProcedure
    .input(z.object({ prompt: z.string() }))
    .mutation(async ({ input }) => {
      const llm = new ChatMistralAI({
        apiKey: "",
        temperature: 0.5,
      })
      const question = `${input.prompt}`

      const response = await llm.invoke(question)

      // O retorno deve ser a estrutura esperada pela aplicação
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
        .where(eq(User.id, ctx.user.id))
      return { success: true, pointsEarned }
    }),

  /**
   * Procedimento para consultar pontos de um usuário.
   *
   * Este procedimento recupera as informações do usuário com base no ID do usuário da sessão atual.
   *
   * Retorna:
   * - Um objeto contendo:
   *   - fullName: O nome completo do usuário.
   *   - email: O email do usuário.
   *   - userCode: O código do usuário.
   *   - userType: O tipo de usuário.
   *   - points: Os pontos totais do usuário (padrão 0 se não disponível).
   *   - canRedeemRewards: Indica se o usuário pode resgatar recompensas.
   */
  getUserInformations: protectedProcedure.query(({ ctx }) => {
    const {
      fullName,
      email,
      canRedeemRewards,
      userCode,
      userType,
      totalPoints,
    } = ctx.user

    return {
      fullName,
      email,
      userCode,
      userType,
      points: totalPoints,
      canRedeemRewards,
    }
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
