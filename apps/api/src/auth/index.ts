import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { Lucia, TimeSpan } from "lucia"

import { db } from "../database/client.ts"
import { Session, User } from "../database/schema.ts"

const adapter = new DrizzlePostgreSQLAdapter(db, Session, User)

declare module "lucia" {
    interface Register {
        Lucia: typeof auth
        DatabaseUserAttributes: Omit<User, "id">
    }
}

export const auth = new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(7, "d"),
    sessionCookie: {
        attributes: {
            secure: process.env.NODE_ENV === "production",
        },
    },
    getUserAttributes: (attributes) => ({
        fullName: attributes.fullName,
        email: attributes.email,
    }),
})

export type Auth = typeof auth
