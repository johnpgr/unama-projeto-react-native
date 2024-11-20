import { relations } from "drizzle-orm"
import { integer, pgTable, text, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import { UserRewards } from "../user/user-rewards.schema.ts"

export type Reward = typeof Reward.$inferSelect
export const Reward = pgTable("reward", {
  id: varchar({ length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  reward: varchar(),
  points: integer().notNull(),
  description: text(),
  imageUrl: text(),
})

export const RewardRelations = relations(Reward, ({ many }) => ({
  userRewards: many(UserRewards),
}))
