import type { Session } from "lucia"
import { GitHub } from "arctic"
import { eq } from "drizzle-orm"

import type { DatabaseUserAttributes } from "../index.ts"
import { db } from "../../../../drizzle/index.ts"
import { User } from "../../../user/user.schema.ts"
import { CreateSessionError } from "../../auth.error.ts"
import { OAuthAccount } from "../../oauth.schema.ts"
import { lucia } from "../index.ts"

export const githubAuth = new GitHub(
  process.env.AUTH_GITHUB_ID ?? "NOOP_NO_GITHUB_CLIENT_ID",
  process.env.AUTH_GITHUB_SECRET ?? "NOOP_NO_GITHUB_SECRET_ID",
  {
    redirectURI: `${process.env.REDIRECT_URL}/auth/github/callback`,
  },
)

export async function getGithubAuthorizationUrl(state: string): Promise<URL> {
  return await githubAuth.createAuthorizationURL(state, {
    scopes: ["read:user", "user:email"],
  })
}

interface GithubUserResponse {
  id: number
  login: string
  name: string
  avatar_url: string
}
interface GithubEmailResponse {
  email: string
  primary: boolean
  verified: boolean
}
export async function createGithubSession(
  idToken: string,
  sessionToken?: string,
): Promise<CreateSessionError | Session> {
  const tokens = await githubAuth.validateAuthorizationCode(idToken)

  const githubUserResponse = (await (
    await fetch("https://api.github.com/user", {
      headers: {
        "User-Agent": "hono",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })
  ).json()) as GithubUserResponse
  const githubEmailResponse = (await (
    await fetch("https://api.github.com/user/emails", {
      headers: {
        "User-Agent": "hono",
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    })
  ).json()) as GithubEmailResponse[]

  const primaryEmail = githubEmailResponse.find((email) => email.primary)
  if (!primaryEmail)
    return new CreateSessionError("Github account with no primary email")

  const existingAccount = await db.query.OAuthAccount.findFirst({
    where: (account) =>
      eq(account.providerUserId, githubUserResponse.id.toString()),
  })
  let existingUser: DatabaseUserAttributes | null = null
  if (sessionToken) {
    const sessionUser = await lucia.validateSession(sessionToken)
    if (sessionUser.user) {
      existingUser = sessionUser.user as DatabaseUserAttributes
    }
  } else {
    const response = await db.query.User.findFirst({
      where: (user) => eq(user.email, primaryEmail.email),
    })
    if (response) {
      existingUser = response
    }
  }
  if (
    existingUser?.emailVerified &&
    primaryEmail.verified &&
    !existingAccount
  ) {
    await db.insert(OAuthAccount).values({
      providerUserId: githubUserResponse.id.toString(),
      provider: "github",
      userId: existingUser.id,
    })
    return await lucia.createSession(existingUser.id, {})
  }

  if (existingAccount) {
    return await lucia.createSession(existingAccount.userId, {})
  } else {
    const [insertedUser] = await db
      .insert(User)
      .values({
        fullName: githubUserResponse.name,
        imageUrl: githubUserResponse.avatar_url,
        email: primaryEmail.email,
        emailVerified: primaryEmail.verified ? new Date() : null,
      })
      .returning()
    if (!insertedUser)
      return new CreateSessionError("Failed to insert new User to database")
    await db.insert(OAuthAccount).values({
      providerUserId: githubUserResponse.id.toString(),
      provider: "github",
      userId: insertedUser.id,
    })
    return await lucia.createSession(insertedUser.id, {})
  }
}
