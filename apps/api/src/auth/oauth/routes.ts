import { generateCodeVerifier, generateState } from "arctic"
import { eq } from "drizzle-orm"
import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"

import type { GoogleOAuthUser } from "./google.ts"
import { db } from "../../database/client.ts"
import { OAuthAccount, User } from "../../database/schema.ts"
import {
    GOOGLE_CODE_VERIFIER,
    GOOGLE_STATE,
    googleAuth,
    isGoogleOAuthUser,
} from "./google.ts"
import { auth } from "../index.ts"

const app = new Hono()

app.get("/sigin/google", async (c) => {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = await googleAuth.createAuthorizationURL(state, codeVerifier)

    setCookie(c, GOOGLE_STATE, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 10 * 1000, // 1 hour
    })

    setCookie(c, GOOGLE_CODE_VERIFIER, codeVerifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 10 * 1000, // 1 hour
    })

    c.status(302)
    c.header("Location", url.toString())
    return c.body(null)
})

app.get("/signin/google/callback", async (c) => {
    const storedState = getCookie(c, GOOGLE_STATE)
    const codeVerifier = getCookie(c, GOOGLE_STATE)
    const state = c.req.query("state")
    const code = c.req.query("code")

    if (
        !storedState ||
        !codeVerifier ||
        !state ||
        storedState !== state ||
        typeof code !== "string"
    ) {
        c.status(400)
        return c.json({
            error: "Invalid OAuth callback state/code",
        })
    }

    try {
        const { accessToken, idToken, refreshToken, accessTokenExpiresAt } =
            await googleAuth.validateAuthorizationCode(code, codeVerifier)
        const response = await fetch(
            "https://www.googleapis.com/oauth2/v1/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            },
        )
        const googleUser = await response.json()

        if (!isGoogleOAuthUser(googleUser)) {
            c.status(500)
            return c.json({
                error: "Failed to parse Google Oauth2 Api response.",
            })
        }

        db.transaction(async (t) => {
            let user = await t.query.User.findFirst({
                where: (user) => eq(user.id, googleUser.id),
            })

            if (!user) {
                const [createdUser] = await t
                    .insert(User)
                    .values({
                        email: googleUser.email,
                        fullName: googleUser.given_name,
                    })
                    .returning()

                if (!createdUser) {
                    t.rollback()
                    c.status(500)
                    return c.json({
                        error: "Failed to insert new user",
                    })
                }
                user = createdUser

                const [createdOAuthAccount] = await t
                    .insert(OAuthAccount)
                    .values({
                        accessToken,
                        refreshToken,
                        expiresAt: accessTokenExpiresAt,
                        provider: "google",
                        providerUserId: googleUser.id,
                        userId: createdUser.id,
                    })
                    .returning()

                if (!createdOAuthAccount) {
                    t.rollback()
                    c.status(500)
                    return c.json({
                        error: "Failed to insert new oauth_account",
                    })
                }
            } else {
                const [updatedOAuthAccount] = await t
                    .update(OAuthAccount)
                    .set({
                        accessToken,
                        refreshToken,
                        expiresAt: accessTokenExpiresAt,
                    })
                    .where(eq(OAuthAccount.id, googleUser.id))
                    .returning()

                if (!updatedOAuthAccount) {
                    t.rollback()
                    c.status(500)
                    return c.json({
                        error: "Failed to update oauth_account",
                    })
                }
            }
            const session = await auth.createSession(user.id, {})
            const sessionCookie = auth.createSessionCookie(session.id)
            setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        })
    } catch (error) {
        c.status(500)
        return c.json({
            error: (error as Error).message,
        })
    }
})

export default app
