import { relations } from "drizzle-orm"
import { date, pgTable, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import { Reward } from "../reward/reward.schema.ts"
import { User } from "../user/user.schema.ts"

/**
 * Many-to-Many table to track rewards that users have redeemed
 */
export type UserRewards = typeof UserRewards.$inferSelect
export const UserRewards = pgTable("user_rewards", {
  id: varchar({ length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  rewardId: varchar("reward_id", { length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar("user_id").references(() => User.id),
  createdAt: date("created_at", { mode: "date" }).notNull().defaultNow(),
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
