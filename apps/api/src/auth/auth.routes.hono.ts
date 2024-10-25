import assert from "assert"
import { zValidator } from "@hono/zod-validator"
import { generateCodeVerifier, generateState } from "arctic"
import { Hono } from "hono"
import { getCookie, setCookie } from "hono/cookie"
import { verifyRequestOrigin } from "lucia"
import { z } from "zod"

import type { AppContext } from "../context.ts"
import { CreateSessionError } from "./errors.ts"
import { lucia } from "./lucia/index.ts"
import { createAppleSession, getAppleAuthorizationUrl } from "./lucia/oauth/apple.ts"
import {
  createGithubSession,
  getGithubAuthorizationUrl,
} from "./lucia/oauth/github.ts"
import {
  createGoogleSession,
  getGoogleAuthorizationUrl,
} from "./lucia/oauth/google.ts"

const COOKIE_OPTS = {
  httpOnly: true,
  maxAge: 60 * 10,
  path: "/",
  secure: process.env.NODE_ENV === "production",
}

export const AuthController = new Hono<AppContext>()
  .get(
    "/:provider",
    zValidator(
      "param",
      z.object({ provider: z.enum(["github", "google", "apple"]) }),
    ),
    zValidator(
      "query",
      z.object({
        redirect: z.string().optional().default("http://localhost:8081"),
        sessionToken: z.string().optional(),
      }),
    ),
    async (c) => {
      const provider = c.req.valid("param").provider
      const redirect = c.req.valid("query").redirect
      const sessionToken = c.req.valid("query").sessionToken
      setCookie(c, "redirect", redirect, COOKIE_OPTS)
      if (sessionToken) {
        const session = await lucia.validateSession(sessionToken)
        if (session.user) {
          //for account linking
          setCookie(c, "sessionToken", sessionToken, COOKIE_OPTS)
        }
      }
      const state = generateState()
      switch (provider) {
        case "github": {
          const url = await getGithubAuthorizationUrl(state)
          setCookie(c, "github_oauth_state", state, COOKIE_OPTS)
          return c.redirect(url.toString())
        }
        case "google": {
          const codeVerifier = generateCodeVerifier()
          const url = await getGoogleAuthorizationUrl(state, codeVerifier)
          setCookie(c, "google_oauth_state", state, COOKIE_OPTS)
          setCookie(c, "google_oauth_code_verifier", codeVerifier, COOKIE_OPTS)
          return c.redirect(url.toString())
        }
        case "apple": {
          const url = await getAppleAuthorizationUrl(state)
          setCookie(c, "apple_oauth_state", state, COOKIE_OPTS)
          return c.redirect(url.toString())
        }
      }
    },
  )
  .all(
    "/:provider/callback",
    zValidator(
      "param",
      z.object({ provider: z.enum(["github", "google", "apple"]) }),
    ),
    async (c) => {
      try {
        const provider = c.req.valid("param").provider
        let stateCookie = getCookie(c, `${provider}_oauth_state`)
        const codeVerifierCookie = getCookie(
          c,
          `${provider}_oauth_code_verifier`,
        )
        const sessionTokenCookie = getCookie(c, "sessionToken")
        let redirect = getCookie(c, "redirect")

        const url = new URL(c.req.url)
        let state = url.searchParams.get("state")
        let code = url.searchParams.get("code")
        const codeVerifierRequired = provider === "google"
        if (c.req.method === "POST") {
          const formData = await c.req.formData()
          state = formData.get("state") as string | null
          stateCookie = state ?? stateCookie
          code = formData.get("code") as string | null
          redirect = process.env.API_URL
        }
        if (
          !state ||
          !stateCookie ||
          !code ||
          stateCookie !== state ||
          !redirect ||
          (codeVerifierRequired && !codeVerifierCookie)
        ) {
          return c.json({ error: "Invalid request." }, 400)
        }

        switch (provider) {
          case "github": {
            const session = await createGithubSession(code, sessionTokenCookie)
            if (session instanceof CreateSessionError) {
              return c.json({ error: session.message }, 400)
            }
            const redirectUrl = new URL(redirect)
            redirectUrl.searchParams.append("token", session.id)
            return c.redirect(redirectUrl.toString())
          }
          case "google": {
            assert(codeVerifierCookie !== undefined)
            const session = await createGoogleSession(
              code,
              codeVerifierCookie,
              sessionTokenCookie,
            )
            if (session instanceof CreateSessionError) {
              return c.json({ error: session.message }, 400)
            }
            const redirectUrl = new URL(redirect)
            redirectUrl.searchParams.append("token", session.id)
            return c.redirect(redirectUrl.toString())
          }
          case "apple": {
            const originHeader = c.req.header("Origin")
            const hostHeader = c.req.header("Host")
            if (
              !originHeader ||
              !hostHeader ||
              !verifyRequestOrigin(originHeader, [
                hostHeader,
                "appleid.apple.com",
              ])
            ) {
              return c.json({ error: "Unauthorized" }, 403)
            }
            const formData = await c.req.formData()
            const userJSON = formData.get("user")
            let user: { fullName: string } | undefined
            if (userJSON) {
              const reqUser = JSON.parse(userJSON as string) as {
                name: { firstName: string; lastName: string }
                email: string
              }
              user = {
                fullName: `${reqUser.name.firstName} ${reqUser.name.lastName}`,
              }
            }
            const session = await createAppleSession({
              code,
              user,
              sessionToken: sessionTokenCookie,
            })
            if (session instanceof CreateSessionError) {
              return c.json({ error: session.message }, 400)
            }
            const redirectUrl = new URL(redirect)
            redirectUrl.searchParams.append("token", session.id)
            return c.redirect(redirectUrl.toString())
          }
        }
      } catch (e) {
        console.error(e)
        if (e instanceof Error) {
          console.error(e.stack)
        }
      }
    },
  )
  .post(
    "/login/:provider",
    zValidator(
      "json",
      z.object({
        idToken: z.string(),
        user: z
          .object({
            fullName: z.string(),
          })
          .optional(),
        sessionToken: z.string().optional(),
      }),
    ),
    zValidator(
      "param",
      z.object({
        provider: z.enum(["github", "google", "apple"]),
      }),
    ),
    async (c) => {
      const provider = c.req.param("provider")
      const idToken = c.req.valid("json").idToken
      const sessionToken = c.req.valid("json").sessionToken
      let session
      switch (provider) {
        case "github": {
          session = await createGithubSession(idToken, sessionToken)
          break
        }
        case "google": {
          session = await createGoogleSession(idToken, "", sessionToken)
          break
        }
        case "apple": {
          session = await createAppleSession({
            idToken,
            user: c.req.valid("json").user,
            sessionToken,
          })
          break
        }
        default: {
          return c.body(null, 400)
        }
      }
      if (session instanceof CreateSessionError) {
        return c.json({ error: session.message }, 400)
      }

      return c.json({ token: session.id })
    },
  )
  .post("/logout", async (c) => {
    const authorizationHeader = c.req.header("Authorization")
    const sessionId = lucia.readBearerToken(authorizationHeader ?? "")
    if (!sessionId) {
      return c.json({ error: "Not logged in" }, 400)
    }
    await lucia.invalidateSession(sessionId)
    return c.body(null, 200)
  })
