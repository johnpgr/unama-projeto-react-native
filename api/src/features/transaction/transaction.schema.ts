import { relations, sql } from "drizzle-orm"
import { desc, eq, gt, not } from "drizzle-orm/expressions"
import { check, index, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import { User } from "../user/user.schema.ts"

export const TradeOffer = pgTable("trade_offer", {
  id: varchar({ length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  user_id: varchar("user_id").references(() => User.id), // Changed from userId
  quantity: integer("quantity").notNull(),
  item_type: text({
    enum: ["plastic", "glass", "metal", "paper", "electronic"],
  }).notNull(), // Changed from itemType
  latitude: varchar("latitude"),
  longitude: varchar("longitude"),
  created_at: timestamp("created_at").defaultNow().notNull(), // Changed from createdAt
  status: text({ enum: ["pending", "accepted", "rejected"] })
    .notNull()
    .default("pending"),
  accepted_by: varchar("accepted_by").references(() => User.id),
})
export const TradeOfferRelations = relations(TradeOffer, ({ one }) => ({
  user: one(User, {
    fields: [TradeOffer.user_id],
    references: [User.id],
  }),
}))

// 2. Type definitions
export type TradeOffer = typeof TradeOffer.$inferSelect
export type NewTradeOffer = typeof TradeOffer.$inferInsert

export const RecyclingTransaction = pgTable(
  "recycling_transaction",
  {
    id: varchar({ length: 21 })
      .primaryKey()
      .$default(() => nanoid()),
    userId: varchar()
      .references(() => User.id)
      .notNull(),
    description: text(),
    weight: integer().notNull(),
    material: text({
      enum: ["plastic", "glass", "metal", "paper", "electronic"],
    }).notNull(),
    points: integer().notNull(),
    createdAt: timestamp({
      withTimezone: true,
      precision: 3,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [index().on(table.userId)],
)

export type RecyclingTransaction = typeof RecyclingTransaction.$inferSelect

export const RecyclingTransactionRelations = relations(RecyclingTransaction, ({ one }) => ({
  user: one(User, {
    references: [User.id],
    fields: [RecyclingTransaction.userId],
  }),
}))

export const P2PTransaction = pgTable(
  "p2p_transaction",
  {
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
    description: text(),
    createdAt: timestamp({ withTimezone: true, precision: 3, mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index().on(table.from),
    index().on(table.to),
    check("sender_not_receiver", not(eq(table.from, table.to))),
    check("amount_positive", gt(table.points, sql`0`)),
  ],
)

export type P2PTransaction = typeof P2PTransaction.$inferSelect

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
