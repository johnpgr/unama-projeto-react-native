import { relations } from "drizzle-orm"
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { uuidv7 } from "uuidv7"

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
