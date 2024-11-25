import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import { User } from "../user/user.schema.ts"

export const TradeOffer = pgTable("trade_offer", {
  id: varchar({ length: 21 })
    .primaryKey()
    .$default(() => nanoid()),
  userId: varchar({ length: 21 }).references(() => User.id),
  quantity: integer().notNull(),
  itemType: text({
    enum: ["plastic", "glass", "metal", "paper", "electronic"],
  }).notNull(),
  latitude: text(),
  longitude: text(),
  createdAt: timestamp({ withTimezone: true, precision: 3, mode: "date" }).defaultNow().notNull(),
  status: text({ enum: ["pending", "accepted", "rejected"] })
    .notNull()
    .default("pending"),
  acceptedBy: varchar({ length: 21 }).references(() => User.id),
})

export type TradeOffer = typeof TradeOffer.$inferSelect
export type NewTradeOffer = typeof TradeOffer.$inferInsert

export const TradeOfferRelations = relations(TradeOffer, ({ one }) => ({
  user: one(User, {
    fields: [TradeOffer.userId],
    references: [User.id],
  }),
}))
