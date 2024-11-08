import { relations } from "drizzle-orm"
import {
  date,
  integer,
  pgTable,
  serial,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

import { User } from "../user/user.schema.ts"

// Node.js + typescript nativo não suporta Enums
export const TransactionType = {
  P2REWARD: "P2REWARD",
  P2P: "P2P",
} as const
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType]

export type RecyclingTransaction = typeof RecyclingTransaction.$inferSelect
export const RecyclingTransaction = pgTable("recycling_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => User.id)
    .notNull(),
  weight: integer("weight").notNull(),
  points: integer("points").notNull(),
  transactionDate: date("transaction_date").defaultNow(),
})

export const RecyclingTransactionRelations = relations(
  RecyclingTransaction,
  ({ one }) => ({
    user: one(User, {
      references: [User.id],
      fields: [RecyclingTransaction.userId],
    }),
  }),
)

export type P2PTransaction = typeof P2PTransaction.$inferSelect
export const P2PTransaction = pgTable("p2p_transaction", {
  id: serial("id"),
  from: varchar("from")
    .references(() => User.userCode)
    .notNull(),
  to: varchar("to")
    .references(() => User.userCode)
    .notNull(),
  points: integer("points").notNull(),
  transactionDate: date("transaction_date").defaultNow(),
})

export const P2PTransactionRelations = relations(P2PTransaction, ({ one }) => ({
  from: one(User, {
    references: [User.userCode],
    fields: [P2PTransaction.from],
  }),
  to: one(User, {
    references: [User.userCode],
    fields: [P2PTransaction.to],
  }),
}))
