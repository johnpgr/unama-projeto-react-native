import { relations } from "drizzle-orm"
import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core"
import { UserRewards } from "../user-rewards/user-rewards.schema.ts"

export const Reward = pgTable("rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  reward: varchar("reward"),
  points: integer("points").notNull(),
  description: varchar("description"),
  image: varchar("image"),
})

export const RewardRelations = relations(Reward, ({ many }) => ({
    userRewards: many(UserRewards)
}))
