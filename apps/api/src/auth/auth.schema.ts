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
    userId: varchar("user_id", { length: 21 })
      .notNull()
      .references(() => User.id),
    provider: text().$type<OAuthAccountProvider>().notNull(),
    providerUserId: text("provider_user_id").notNull(),
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
  userId: varchar("user_id", { length: 21 })
    .notNull()
    .references(() => User.id),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
})

export const SessionRelations = relations(Session, ({ one }) => ({
  user: one(User, { references: [User.id], fields: [Session.userId] }),
}))
