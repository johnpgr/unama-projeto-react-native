import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import { OAuthAccount, Session } from "../auth/auth.schema.ts"
import { RecyclingTransaction } from "../transaction/transaction.schema.ts"
import { UserRewards } from "../user-rewards/user-rewards.schema.ts"

export const UserTypeEnum = pgEnum("user_type", [
  "normal",
  "cooperative",
  "admin",
])

export type User = typeof User.$inferSelect
export const User = pgTable("user", {
  id: varchar({ length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  fullName: text("full_name").notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  hashedPassword: text("hashed_password"),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
  imageUrl: text("image_url"),
  userType: UserTypeEnum("user_type").notNull().default("normal"),
  totalPoints: integer("total_points").notNull().default(1000),
  canRedeemRewards: boolean("can_redeem_rewards").notNull().default(true),
})

export const UserRelations = relations(User, ({ many }) => ({
  sessions: many(Session),
  accounts: many(OAuthAccount),
  recyclingTransactions: many(RecyclingTransaction),
  rewards: many(UserRewards),
}))
