import { relations } from "drizzle-orm"
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import {
  P2PTransaction,
  RecyclingTransaction,
} from "../transaction/transaction.schema.ts"
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
  p2pTransactionsFrom: many(P2PTransaction, { relationName: "from" }),
  p2pTransactionsTo: many(P2PTransaction, { relationName: "to" }),
  rewards: many(UserRewards),
}))

export type OAuthAccountProvider = "google" | "apple" | "github"

export type OAuthAccount = typeof OAuthAccount.$inferSelect
export const OAuthAccount = pgTable(
  "oauth_account",
  {
    userId: varchar({ length: 21 })
      .notNull()
      .references(() => User.id),
    provider: text().$type<OAuthAccountProvider>().notNull(),
    providerUserId: text().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
  }),
)
export const OAuthAccountRelations = relations(OAuthAccount, ({ one }) => ({
  user: one(User, { references: [User.id], fields: [OAuthAccount.userId] }),
}))

export type Session = typeof Session.$inferSelect
export const Session = pgTable("session", {
  id: text().primaryKey(),
  userId: varchar({ length: 21 })
    .notNull()
    .references(() => User.id),
  expiresAt: timestamp({
    withTimezone: true,
    mode: "date",
    precision: 3,
  }).notNull(),
})

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { references: [User.id], fields: [Session.userId] }),
}))
