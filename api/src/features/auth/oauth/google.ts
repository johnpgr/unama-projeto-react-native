import { Google } from "arctic"
import { eq } from "drizzle-orm"

import { env } from "../../../config/env.ts"
import { db } from "../../../drizzle/index.ts"
import { OAuthAccount, User } from "../../user/user.schema.ts"
import { CreateSessionError, InvalidSessionError } from "../auth.error.ts"
import { sessionService } from "../auth.session.ts"
import type { CreatedSession } from "./types.ts"

export const googleAuth = new Google(
  env.AUTH_GOOGLE_ID ?? "NOOP_NO_GOOGLE_ID",
  env.AUTH_GOOGLE_SECRET ?? "NOOP_NO_GOOGLE_SECRET",
  `${env.APP_URL}/auth/google/callback`,
)

export async function getGoogleAuthorizationUrl(
  state: string,
  codeVerifier: string,
): Promise<URL> {
  return await googleAuth.createAuthorizationURL(state, codeVerifier, {
    scopes: ["profile", "email"],
  })
}

interface GoogleUserResponse {
  sub: string
  name: string
  email: string
  email_verified: boolean
  picture: string
}

export async function createGoogleSession(
  idToken: string,
  codeVerifier: string,
  sessionToken?: string,
): Promise<CreateSessionError | CreatedSession> {
  const tokens = await googleAuth.validateAuthorizationCode(
    idToken,
    codeVerifier,
  )
  const user = (await (
    await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })
  ).json()) as GoogleUserResponse

  const existingAccount = await db.query.OAuthAccount.findFirst({
    where: (account) => eq(account.providerUserId, user.sub),
  })
  let existingUser: User | null = null

  if (sessionToken) {
    const sessionUser = await sessionService.validateSessionToken(sessionToken)
    if (!(sessionUser instanceof InvalidSessionError)) {
      existingUser = sessionUser.user
    }
  } else {
    const response = await db.query.User.findFirst({
      where: (_user) => eq(_user.email, user.email),
    })
    if (response) {
      existingUser = response
    }
  }

  if (existingUser?.emailVerified && user.email_verified && !existingAccount) {
    await db.insert(OAuthAccount).values({
      providerUserId: user.sub,
      provider: "google",
      userId: existingUser.id,
    })
    return await sessionService.createSession(existingUser.id)
  }
  if (existingAccount) {
    return await sessionService.createSession(existingAccount.userId)
  } else {
    const [insertedUser] = await db
      .insert(User)
      .values({
        fullName: user.name,
        email: user.email,
        emailVerified: user.email_verified ? new Date() : null,
        imageUrl: user.picture,
      })
      .returning()

    if (!insertedUser)
      return new CreateSessionError("Failed to insert new user into database")

    await db.insert(OAuthAccount).values({
      providerUserId: user.sub,
      provider: "google",
      userId: insertedUser.id,
    })
    return await sessionService.createSession(insertedUser.id)
  }
}
