import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { OAuthAccount, Session } from "../auth/auth.schema.ts"
import { RecyclingTransaction } from "../transaction/transaction.schema.ts"
import { UserRewards } from "../user-rewards/user-rewards.schema.ts"
import { randomUserCode } from "./codes.ts"

export const UserTypeEnum = pgEnum("user_type", [
  "normal",
  "cooperative",
  "admin",
])

export type User = typeof User.$inferSelect
export const User = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"),
  emailVerified: boolean("email_verified").notNull().default(false),
  userCode: varchar("user_code", { length: 5 })
    .notNull()
    .$defaultFn(() => randomUserCode(5))
    .unique(),
  imageUrl: text("image_url"),
  userType: UserTypeEnum("user_type")
    .notNull()
    .default(UserTypeEnum.enumValues[2]),
  totalPoints: integer("total_points").notNull().default(1000),
  canRedeemRewards: boolean("can_redeem_rewards").notNull().default(true),
})

export const UserRelations = relations(User, ({ many }) => ({
  sessions: many(Session),
  accounts: many(OAuthAccount),
  recyclingTransactions: many(RecyclingTransaction),
  rewards: many(UserRewards),
}))
