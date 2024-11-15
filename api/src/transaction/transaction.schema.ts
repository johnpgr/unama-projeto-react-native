import { relations } from "drizzle-orm"
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import { User } from "../user/user.schema.ts"

export type RecyclingTransaction = typeof RecyclingTransaction.$inferSelect
export const RecyclingTransaction = pgTable("recycling_transaction", {
  id: varchar({ length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar()
    .references(() => User.id)
    .notNull(),
  weight: integer().notNull(),
  points: integer().notNull(),
  createdAt: timestamp({
    withTimezone: true,
    precision: 3,
    mode: "date",
  })
    .notNull()
    .defaultNow(),
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
  id: varchar({ length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  from: varchar()
    .references(() => User.id)
    .notNull(),
  to: varchar()
    .references(() => User.id)
    .notNull(),
  points: integer().notNull(),
  createdAt: timestamp({ withTimezone: true, precision: 3, mode: "date" })
    .notNull()
    .defaultNow(),
})

export const P2PTransactionRelations = relations(P2PTransaction, ({ one }) => ({
  from: one(User, {
    relationName: "from",
    references: [User.id],
    fields: [P2PTransaction.from],
  }),
  to: one(User, {
    relationName: "to",
    references: [User.id],
    fields: [P2PTransaction.to],
  }),
}))
