import type {
    DefaultSession,
    NextAuthConfig,
    Session as NextAuthSession,
} from "next-auth"
import { skipCSRFCheck } from "@auth/core"
import CredentialsProvider from "@auth/core/providers/credentials"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import * as jwt from "next-auth/jwt"
import GoogleProvider from "next-auth/providers/google"

import { db } from "@projeto/db/client"
import { OAuthAccount, Session, User } from "@projeto/db/schema"

import { env } from "../env"
import { eq } from "@projeto/db"
import { PasswordHasher } from "@projeto/passwords"

const passwordHasher = PasswordHasher.getInstance()

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
    }
}

export const adapter = DrizzleAdapter(db, {
    usersTable: User,
    accountsTable: OAuthAccount,
    sessionsTable: Session,
})

export const isSecureContext = env.NODE_ENV !== "development"

export const authConfig = {
    adapter,
    // In development, we need to skip checks to allow Expo to work
    ...(!isSecureContext
        ? {
              skipCSRFCheck: skipCSRFCheck,
              trustHost: true,
          }
        : {}),
    secret: env.AUTH_SECRET,
    providers: [
        GoogleProvider({
            clientId: env.AUTH_GOOGLE_ID,
            clientSecret: env.AUTH_GOOGLE_SECRET,
        }),
        CredentialsProvider({
            name: "email-password",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "Seu email",
                },
                password: {
                    label: "Senha",
                    type: "password",
                    placeholder: "Sua senha",
                },
            },
            async authorize(credentials, _) {
                const { email, password } = credentials
                if (typeof email !== "string" || typeof password !== "string") {
                    return null
                }

                const user = await db.query.User.findFirst({
                    where: ({ email }) => eq(email, email),
                })
                if (!user) {
                    return null
                }

                const matchPassword = await passwordHasher.compare(password, user.email)
                if (!matchPassword) {
                    return null
                }

                //@ts-expect-error Ok
                delete user["hashedPassword"]

                return user
            },
        }),
    ],
    callbacks: {
        jwt: ({ token, account }) => {
            if (account?.provider === "credentials") {
                token.credentials = true
            }
            return token
        },
        session: (opts) => {
            if (!("user" in opts))
                throw new Error("unreachable with session strategy")

            return {
                ...opts.session,
                user: {
                    ...opts.session.user,
                    id: opts.user.id,
                },
            }
        },
    },
    jwt: {
        encode: async function (params) {
            const sessionToken = await jwt.encode({
                token: params.token,
                salt: params.salt,
                secret: env.AUTH_SECRET!,
            })
            if (!params.token?.credentials) {
                return sessionToken
            }
            if (!params.token.sub) {
                throw new Error("No User ID found in token")
            }
            const session = await adapter.createSession!({
                sessionToken,
                userId: params.token.sub,
                expires: new Date(params.token?.exp ?? 7 * 24 * 60 * 60 * 1000),
            })

            if (!session) {
                throw new Error("Failed to create session")
            }

            return sessionToken
        },
    },
} satisfies NextAuthConfig

export const validateToken = async (
    token: string,
): Promise<NextAuthSession | null> => {
    const sessionToken = token.slice("Bearer ".length)
    const session = await adapter.getSessionAndUser?.(sessionToken)
    return session
        ? {
              user: {
                  ...session.user,
              },
              expires: session.session.expires.toISOString(),
          }
        : null
}

export const invalidateSessionToken = async (token: string) => {
    await adapter.deleteSession?.(token)
}
