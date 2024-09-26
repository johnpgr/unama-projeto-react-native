import type { JsonWebKey } from "crypto"
import type { Session } from "lucia"
import jwt from "@tsndr/cloudflare-worker-jwt"
import { Apple } from "arctic"
import { eq } from "drizzle-orm"

import type { DatabaseUserAttributes } from "."
import { lucia } from "./lucia.ts"
import { db } from "../database/client.ts"
import { OAuthAccount, User } from "../database/schema.ts"
import { CreateSessionError } from "./errors.ts"

export const appleAuth = new Apple(
    {
        clientId:
            process.env.AUTH_APPLE_WEB_CLIENT_ID ??
            "NOOP_NO_APPLE_WEB_CLIENT_ID",
        teamId: process.env.AUTH_APPLE_TEAM_ID ?? "NOOP_NO_APPLE_TEAM_ID",
        keyId: process.env.AUTH_APPLE_KEY_ID ?? "NOOP_NO_APPLE_KEY_ID",
        certificate:
            process.env.AUTH_APPLE_PRIVATE_KEY ?? "NOOP_NO_APPLE_PRIVATE_KEY",
    },
    `${process.env.API_URL}/auth/apple/callback`,
)

export async function getAppleAuthorizationUrl(state: string): Promise<URL> {
    const url = await appleAuth.createAuthorizationURL(state, {
        scopes: ["name", "email"],
    })
    url.searchParams.set("response_mode", "form_post")
    return url
}

interface ApplePublicKey {
    keys: (JsonWebKey & { kid: string })[]
}

export async function createAppleSession(params: {
    code?: string
    idToken?: string
    sessionToken?: string
    user?: {
        fullName: string
    }
}): Promise<CreateSessionError | Session> {
    let idToken = params.idToken
    if (!idToken) {
        if (!params.code) {
            return new CreateSessionError("No code provided")
        }
        const tokens = await appleAuth.validateAuthorizationCode(params.code)
        idToken = tokens.idToken
    }
    const { payload, header } = jwt.decode<
        {
            email: string
            email_verified: string
            sub: string
        },
        { kid: string }
    >(idToken)

    const applePublicKey = (await (
        await fetch("https://appleid.apple.com/auth/keys")
    ).json()) as ApplePublicKey
    const publicKey = applePublicKey.keys.find((key) => key.kid === header?.kid)
    if (!publicKey) {
        return new CreateSessionError("No public key")
    }
    const isValid = await jwt.verify(idToken, publicKey, { algorithm: "RS256" })

    if (
        !isValid ||
        !payload ||
        payload.iss !== "https://appleid.apple.com" ||
        !(
            payload?.aud === process.env.APPLE_CLIENT_ID ||
            payload.aud === process.env.APPLE_WEB_CLIENT_ID
        ) ||
        !payload.exp ||
        payload?.exp < Date.now() / 1000
    ) {
        return new CreateSessionError("Invalid payload")
    }

    const existingAccount = await db.query.OAuthAccount.findFirst({
        where: (account, { eq }) =>
            eq(account.providerUserId, payload.sub.toString()),
    })

    let existingUser: DatabaseUserAttributes | null = null

    if (params.sessionToken) {
        const sessionUser = await lucia.validateSession(params.sessionToken)
        if (sessionUser.user) {
            existingUser = sessionUser.user as DatabaseUserAttributes
        }
    } else {
        const response = await db.query.User.findFirst({
            where: (_user) => eq(_user.email, payload.email),
        })
        if (response) {
            existingUser = response
        }
    }

    if (
        existingUser?.emailVerified &&
        payload.email_verified &&
        !existingAccount
    ) {
        await db.insert(OAuthAccount).values({
            providerUserId: payload.sub.toString(),
            provider: "apple",
            userId: existingUser.id,
        })
        const session = await lucia.createSession(existingUser.id, {})
        return session
    }

    if (existingAccount) {
        return await lucia.createSession(existingAccount.userId, {})
    } else {
        const [insertedUser] = await db
            .insert(User)
            .values({
                fullName: params.user?.fullName ?? "unknown apple user",
                email: payload.email,
                emailVerified: Boolean(payload.email_verified),
                imageUrl: null,
            })
            .returning()

        if (!insertedUser)
            return new CreateSessionError(
                "Failed to insert new user to database",
            )

        await db.insert(OAuthAccount).values({
            providerUserId: payload.sub,
            provider: "apple",
            userId: insertedUser.id,
        })

        return await lucia.createSession(insertedUser.id, {})
    }
}
