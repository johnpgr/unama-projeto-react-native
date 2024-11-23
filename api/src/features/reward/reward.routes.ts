import { TRPCError } from "@trpc/server"
import { asc, eq, sql } from "drizzle-orm"
import { z } from "zod"

import { db } from "../../drizzle/index.ts"
import { protectedProcedure, publicProcedure } from "../../trpc/index.ts"
import { UserRewards } from "../user/user-rewards.schema.ts"
import { User } from "../user/user.schema.ts"
import { Reward } from "./reward.schema.ts"

export const rewardRouter = {
  getAvailableRewards: publicProcedure.query(async () => {
    return await db.query.Reward.findMany({
      orderBy: (reward) => asc(reward.points),
    })
  }),

  requestReward: protectedProcedure
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
