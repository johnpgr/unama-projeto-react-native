import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { Lucia, TimeSpan } from "lucia"

import { db } from "../../../database/client.ts"
import { User } from "../../user/user.schema.ts"
import { Session } from "../auth.schema.ts"

const adapter = new DrizzlePostgreSQLAdapter(db, Session, User)

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}
export type DatabaseUserAttributes = typeof User.$inferSelect

export type LuciaAuth = typeof lucia
export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(7, "d"),
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => ({
    fullName: attributes.fullName,
    email: attributes.email,
    imageUrl: attributes.imageUrl,
    userType: attributes.userType,
    totalPoints: attributes.totalPoints,
    canRedeemRewards: attributes.canRedeemRewards,
  }),
})
