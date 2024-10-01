import type { Context } from "hono"
import type { User } from "lucia"

import type { AppContext } from "../context.ts"
import type { DatabaseUserAttributes } from "./lucia.ts"
import { lucia } from "./lucia.ts"

export const AuthMiddleware = async (
    c: Context<AppContext>,
    next: () => Promise<void>,
) => {
    if (c.req.path.startsWith("/auth")) {
        return next()
    }

    const authorizationHeader = c.req.header("Authorization")
    const sessionId = lucia.readBearerToken(authorizationHeader ?? "")
    if (!sessionId) {
        c.set("user", null)
        c.set("session", null)
        return next()
    }
    const { session, user } = await lucia.validateSession(sessionId)
    if (!session) {
        c.set("user", null)
        c.set("session", null)
        return next()
    }
    if (session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id)
        c.header("Set-Cookie", sessionCookie.serialize())
    }
    c.set("user", user as User & DatabaseUserAttributes)
    c.set("session", session)
    return next()
}
