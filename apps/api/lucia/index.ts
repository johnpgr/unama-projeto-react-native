import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle"
import { Lucia } from "lucia"

import { db } from "../drizzle/client.ts"
import { Session, User } from "../drizzle/schema.ts"

const adapter = new DrizzlePostgreSQLAdapter(db, Session, User)

export const lucia = new Lucia(adapter, {
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

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia
        DatabaseUserAttributes: Omit<User, "id">
    }
}
