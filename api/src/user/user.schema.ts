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

import { OAuthAccount, Session } from "../auth/oauth.schema.ts"
import { RecyclingTransaction } from "../transaction/transaction.schema.ts"
import { UserRewards } from "./user-rewards.schema.ts"

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
  fullName: text().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  hashedPassword: text(),
  emailVerified: timestamp({
    mode: "date",
    withTimezone: true,
  }),
  imageUrl: text(),
  userType: UserTypeEnum().notNull().default("normal"),
  totalPoints: integer().notNull().default(1000),
  canRedeemRewards: boolean().notNull().default(true),
})

export const UserRelations = relations(User, ({ many }) => ({
  sessions: many(Session),
  accounts: many(OAuthAccount),
  recyclingTransactions: many(RecyclingTransaction),
  rewards: many(UserRewards),
}))
