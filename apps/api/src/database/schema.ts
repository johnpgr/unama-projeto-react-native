import { inArray, relations, sql } from "drizzle-orm"
import {
    boolean,
    date,
    integer,
    pgEnum,
    pgTable,
    primaryKey,
    serial,
    text,
    timestamp,
    uuid,
} from "drizzle-orm/pg-core"

export const userType = pgEnum("user_type", ["normal", "cooperative"])
export const User = pgTable("user", {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    hashedPassword: text("hashed_password"),
    emailVerified: boolean("email_verified").notNull().default(false),
    imageUrl: text("image_url"),
    userType: userType("user_type").default(userType.enumValues[0]),
    totalPoints: integer("total_points").default(1000),
    canRedeemRewards: boolean("can_redeem_rewards").default(true),
})
export type User = typeof User.$inferSelect

export type OAuthAccountProvider = "google" | "apple" | "github"

export const OAuthAccount = pgTable(
    "oauth_account",
    {
        userId: uuid("user_id")
            .notNull()
            .references(() => User.id),
        provider: text("provider").$type<OAuthAccountProvider>().notNull(),
        providerUserId: text("provider_user_id").notNull(),
        userType: text("user_type").notNull().default(userType.enumValues[0]),
        totalPoints: integer("total_points").default(1000),
        canRedeemRewards: boolean("can_redeem_rewards").default(true),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
    }),
)
export const OAuthAccountRelations = relations(OAuthAccount, ({ one }) => ({
    user: one(User, { references: [User.id], fields: [OAuthAccount.userId] }),
}))

export const UserRelations = relations(User, ({ many }) => ({
    sessions: many(Session),
    accounts: many(OAuthAccount),
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

export const recyclingTransactions = pgTable("recycling_transactions", {
    id: serial("id").primaryKey(),
    userId: uuid("id")
        .primaryKey()
        .references(() => User.id)
        .notNull(),
    weight: integer("weight").notNull(), // Peso dos resíduos reciclados
    points: integer("points").notNull(), // Pontos ganhos
    transactionDate: date("transaction_date").defaultNow(), // Data da transação
})
