import { relations } from "drizzle-orm"
import { date, pgTable, uuid } from "drizzle-orm/pg-core"

import { Reward } from "../reward/reward.schema.ts"
import { User } from "../user/user.schema.ts"

/**
 * Many-to-Many table to track rewards that users have redeemed
 */
export const UserRewards = pgTable("user_rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  rewardId: uuid("reward_id")
    .references(() => Reward.id)
    .notNull(),
  userId: uuid("user_id").references(() => User.id),
  createdAt: date("created_at").defaultNow(),
})

export const UserRewardsRelations = relations(UserRewards, ({ one }) => ({
  user: one(User, {
    fields: [UserRewards.userId],
    references: [User.id],
  }),
  reward: one(Reward, {
    fields: [UserRewards.rewardId],
    references: [Reward.id],
  }),
}))
