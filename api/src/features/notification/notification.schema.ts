import { relations } from "drizzle-orm"
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core"
import { nanoid } from "nanoid"

import { User } from "../user/user.schema.ts"

export const Notification = pgTable(
  "notification",
  {
    id: varchar({ length: 21 })
      .primaryKey()
      .$default(() => nanoid()),
    userId: varchar({ length: 21 })
      .references(() => User.id)
      .notNull(),
    title: text().notNull(),
    body: text().notNull(),
    type: text({ enum: ["info", "warning", "error"] })
      .notNull()
      .default("info"),
    metadata: jsonb(),
    createdAt: timestamp({ mode: "date", precision: 3, withTimezone: true })
      .defaultNow()
      .notNull(),
    readAt: timestamp({ mode: "date", precision: 3, withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index().on(table.userId),
  }),
)

export type Notification = typeof Notification.$inferSelect
export type NewNotification = typeof Notification.$inferInsert

export const NotificationRelations = relations(Notification, ({ one }) => ({
  user: one(User, {
    fields: [Notification.userId],
    references: [User.id],
  }),
}))
