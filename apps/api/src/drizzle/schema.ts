import { relations } from "drizzle-orm"
import {
    pgTable,
    text,
    uuid,
    timestamp,
} from "drizzle-orm/pg-core"

export const User = pgTable("user", {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    hashedPassword: text("hashed_password"),
})
export type User = typeof User.$inferSelect

export const UserRelations = relations(User, ({ many }) => ({
    sessions: many(Session),
}))

export const Session = pgTable("session", {
    id: text("id").primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => User.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
})
export type Session = typeof Session.$inferSelect

export const SessionRelations = relations(Session, ({ one }) => ({
    user: one(User, { references: [User.id], fields: [Session.userId] }),
}))
