import { relations } from "drizzle-orm"
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import { Reward } from "../reward/reward.schema.ts"
import { User } from "./user.schema.ts"

/**
 * Many-to-Many table to track rewards that users have redeemed
 */
export const UserRewards = pgTable("user_rewards", {
  id: varchar({ length: 21 })
    .notNull()
    .$default(() => nanoid()),
  rewardId: varchar({ length: 21 })
    .notNull()
    .references(() => Reward.id),
  userId: varchar()
    .notNull()
    .references(() => User.id),
  createdAt: timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type UserRewards = typeof UserRewards.$inferSelect

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
