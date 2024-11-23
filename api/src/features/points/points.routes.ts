import { eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../drizzle/index.ts"
import { protectedProcedure } from "../../trpc/index.ts"
import { User } from "../user/user.schema.ts"

export const pointsRouter = {
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
  addPointsToCooperative: protectedProcedure
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
}
