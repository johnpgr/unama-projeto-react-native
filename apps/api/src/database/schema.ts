import { relations } from "drizzle-orm"
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
  varchar,
} from "drizzle-orm/pg-core"

function randomUserCode(maxLength: number) {
  // Ensure maxLength is a positive integer
  if (maxLength <= 0 || !Number.isInteger(maxLength)) {
    throw new Error("maxLength must be a positive integer.")
  }

  let result = ""
  for (let i = 0; i < maxLength; i++) {
    // Generate a random digit between 0 and 9
    const randomDigit = Math.floor(Math.random() * 10)
    result += randomDigit
  }

  return result
}

export const UserTypeEnum = pgEnum("user_type", ["normal", "cooperative"])
export const User = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  hashedPassword: text("hashed_password"),
  emailVerified: boolean("email_verified").notNull().default(false),
  userCode: varchar("user_code", { length: 5 })
    .notNull()
    .$defaultFn(() => randomUserCode(5))
    .unique(),
  imageUrl: text("image_url"),
  userType: UserTypeEnum("user_type").default(UserTypeEnum.enumValues[0]),
  totalPoints: integer("total_points").default(1000),
  canRedeemRewards: boolean("can_redeem_rewards").default(true),
})
export type User = typeof User.$inferSelect

export const UserRelations = relations(User, ({ many }) => ({
  sessions: many(Session),
  accounts: many(OAuthAccount),
  recyclingTransactions: many(RecyclingTransaction),
}))
//14963

export type OAuthAccountProvider = "google" | "apple" | "github"

export const OAuthAccount = pgTable(
  "oauth_account",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => User.id),
    provider: text("provider").$type<OAuthAccountProvider>().notNull(),
    providerUserId: text("provider_user_id").notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.provider, table.providerUserId] }),
  }),
)
export const OAuthAccountRelations = relations(OAuthAccount, ({ one }) => ({
  user: one(User, { references: [User.id], fields: [OAuthAccount.userId] }),
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

export const RecyclingTransaction = pgTable("recycling_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => User.id)
    .notNull(),
  weight: integer("weight").notNull(),
  points: integer("points").notNull(),
  transactionDate: date("transaction_date").defaultNow(),
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

export const P2PTransaction = pgTable("p2p_transaction", {
  id: serial("id"),
  from: varchar("from")
    .references(() => User.userCode)
    .notNull(),
  to: varchar("to")
    .references(() => User.userCode)
    .notNull(),
  points: integer("points").notNull(),
  transactionDate: date("transaction_date").defaultNow(),
})
export const P2PTransactionRelations = relations(P2PTransaction, ({ one }) => ({
  from: one(User, {
    references: [User.userCode],
    fields: [P2PTransaction.from],
  }),
  to: one(User, {
    references: [User.userCode],
    fields: [P2PTransaction.to],
  }),
}))
