import { relations } from "drizzle-orm"
import {
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"

import { User } from "../user/user.schema.ts"

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
