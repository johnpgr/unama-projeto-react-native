import { relations } from "drizzle-orm"
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { createInsertSchema } from "drizzle-zod"
import { uuidv7 } from "uuidv7"
import { z } from "zod"

import { now } from "./utils"

// Tabela temporaria, apenas demonstrativa.
export const Post = sqliteTable("post", {
    id: text("id")
        .notNull()
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    title: text("name", { length: 256 }).notNull(),
    content: text("content").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
        .default(now)
        .notNull(),
    updatedAt: integer("updated_at", {
        mode: "timestamp_ms",
    }).$onUpdateFn(() => now),
})

export const CreatePost = createInsertSchema(Post, {
    title: z.string().max(256),
    content: z.string().max(256),
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
})

export const User = sqliteTable("user", {
    id: text("id")
        .notNull()
        .primaryKey()
        .$defaultFn(() => uuidv7()),
    name: text("name", { length: 255 }),
    email: text("email", { length: 255 }).notNull(),
    emailVerified: integer("email_verified", {
        mode: "timestamp_ms",
    }),
    image: text("image", { length: 255 }),
})

export const UserRelations = relations(User, ({ many }) => ({
    accounts: many(Account),
}))

export const Account = sqliteTable(
    "account",
    {
        userId: text("user_id")
            .notNull()
            .references(() => User.id, { onDelete: "cascade" }),
        type: text("type", { length: 255 })
            .$type<"email" | "oauth" | "oidc" | "webauthn">()
            .notNull(),
        provider: text("provider", { length: 255 }).notNull(),
        providerAccountId: text("provider_account_id", {
            length: 255,
        }).notNull(),
        refresh_token: text("refresh_token", { length: 255 }),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type", { length: 255 }),
        scope: text("scope", { length: 255 }),
        id_token: text("id_token"),
        session_state: text("session_state", { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
    }),
)

export const AccountRelations = relations(Account, ({ one }) => ({
    user: one(User, { fields: [Account.userId], references: [User.id] }),
}))

export const Session = sqliteTable("session", {
    sessionToken: text("session_token", { length: 255 }).notNull().primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => User.id, { onDelete: "cascade" }),
    expires: integer("expires", {
        mode: "timestamp_ms",
    }).notNull(),
})

export const SessionRelations = relations(Session, ({ one }) => ({
    user: one(User, { fields: [Session.userId], references: [User.id] }),
}))
