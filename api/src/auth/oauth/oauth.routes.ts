import assert from "assert"
import type http from "http"
import { generateCodeVerifier, generateState } from "arctic"
import { z } from "zod"

import type { Session } from "../../user/user.schema.ts"
import { CreateSessionError, InvalidSessionError } from "../auth.error.ts"
import { sessionService } from "../auth.session.ts"
import { createAppleSession, getAppleAuthorizationUrl } from "./apple.ts"
import { createGithubSession, getGithubAuthorizationUrl } from "./github.ts"
import { createGoogleSession, getGoogleAuthorizationUrl } from "./google.ts"
import { verifyRequestOrigin } from "./utils.ts"

const AppleUserObj = z.object({
  name: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
})

const OAuthLoginBody = z.object({
  idToken: z.string(),
  sessionToken: z.string(),
  user: z
    .object({
      fullName: z.string(),
    })
    .optional(),
})

type OAuthProvider = "github" | "google" | "apple"

interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: "Strict" | "Lax" | "None"
  path?: string
  domain?: string
  maxAge?: number
  expires?: Date
}

const COOKIE_OPTS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 30, // 30 days
}

const parseCookies = (cookieHeader: string) =>
  cookieHeader.split(";").reduce((cookies: Record<string, string>, cookie) => {
    const [name, value] = cookie.trim().split("=")
    if (!name || !value) return cookies
    cookies[name] = value
    return cookies
  }, {})

const serializeCookie = (
  name: string,
  value: string,
  options: CookieOptions = {},
): string => {
  const opts = { ...COOKIE_OPTS, ...options }
  let cookie = `${name}=${value}`

  if (opts.maxAge) cookie += `; Max-Age=${opts.maxAge}`
  if (opts.expires) cookie += `; Expires=${opts.expires.toUTCString()}`
  if (opts.path) cookie += `; Path=${opts.path}`
  if (opts.domain) cookie += `; Domain=${opts.domain}`
  if (opts.httpOnly) cookie += "; HttpOnly"
  if (opts.secure) cookie += "; Secure"
  if (opts.sameSite) cookie += `; SameSite=${opts.sameSite}`

  return cookie
}

export const handleOAuthRequest = async (
  url: URL,
  req: Request,
  res: http.ServerResponse,
) => {
  try {
    const _cookies = req.headers.get("cookie")
    const cookies = _cookies ? parseCookies(_cookies) : {}

    // OAuth Login Routes - GET /:provider
    if (
      req.method === "GET" &&
      /^\/auth\/(github|google|apple)$/.test(url.pathname)
    ) {
      const provider = url.pathname.split("/")[2] as OAuthProvider
      const redirect =
        url.searchParams.get("redirect") ?? "http://localhost:8081"
      const sessionToken = url.searchParams.get("sessionToken")
      const state = generateState()

      // Set cookies with proper options
      res.setHeader("Set-Cookie", [
        serializeCookie("redirect", redirect, { maxAge: 600 }), // 10 minutes
        serializeCookie(`${provider}_oauth_state`, state, { maxAge: 600 }),
      ])

      if (sessionToken) {
        const session = await sessionService.validateSessionToken(sessionToken)
        if (!(session instanceof InvalidSessionError)) {
          res.setHeader(
            "Set-Cookie",
            serializeCookie("sessionToken", sessionToken),
          )
        }
      }

      let authUrl: URL
      switch (provider) {
        case "github": {
          authUrl = await getGithubAuthorizationUrl(state)
          break
        }
        case "google": {
          const codeVerifier = generateCodeVerifier()
          authUrl = await getGoogleAuthorizationUrl(state, codeVerifier)
          res.setHeader(
            "Set-Cookie",
            serializeCookie("google_oauth_code_verifier", codeVerifier, {
              maxAge: 600,
            }),
          )
          break
        }
        case "apple": {
          authUrl = await getAppleAuthorizationUrl(state)
          break
        }
      }

      res.writeHead(302, { Location: authUrl.toString() })
      res.end()
      return
    }

    // OAuth Callback Routes - POST|GET /:provider/callback
    if (/^\/auth\/(github|google|apple)\/callback$/.test(url.pathname)) {
      const provider = url.pathname.split("/")[1] as OAuthProvider
      const stateCookie = cookies[`${provider}_oauth_state`]
      const codeVerifier = cookies[`${provider}_oauth_code_verifier`]
      const sessionToken = cookies.sessionToken
      const redirect = cookies.redirect

      // Clear OAuth-related cookies after use
      res.setHeader("Set-Cookie", [
        serializeCookie(`${provider}_oauth_state`, "", { maxAge: 0 }),
        serializeCookie(`${provider}_oauth_code_verifier`, "", { maxAge: 0 }),
        serializeCookie("redirect", "", { maxAge: 0 }),
      ])

      const urlParams = new URLSearchParams(url.search)
      let state: string | null = urlParams.get("state")
      let code: string | null = urlParams.get("code")

      if (req.method === "POST") {
        const formData = await req.formData()
        state = formData.get("state")?.toString() ?? state
        code = formData.get("code")?.toString() ?? code
      }

      if (
        !state ||
        !stateCookie ||
        !code ||
        stateCookie !== state ||
        !redirect
      ) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Invalid request" }))
        return
      }

      let session: CreateSessionError | Session
      switch (provider) {
        case "github": {
          session = await createGithubSession(code, sessionToken)
          break
        }
        case "google": {
          assert(codeVerifier)
          session = await createGoogleSession(code, codeVerifier, sessionToken)
          break
        }
        case "apple": {
          const origin = req.headers.get("origin") ?? ""
          if (!verifyRequestOrigin(origin, [url.host, "appleid.apple.com"])) {
            res.writeHead(403).end("Unauthorized")
            return
          }
          const formData = await req.formData()
          let user: { fullName: string } | undefined
          if (formData.has("user")) {
            const userData = AppleUserObj.safeParse(
              JSON.parse(formData.get("user") as string),
            )
            if (!userData.success) {
              res.writeHead(400, { "Content-Type": "application/json" })
              res.end(JSON.stringify({ error: "Invalid request" }))
              return
            }
            user = {
              fullName: `${userData.data.name.firstName} ${userData.data.name.lastName}`,
            }
          }
          session = await createAppleSession({ code, user, sessionToken })
          break
        }
      }

      if (session instanceof CreateSessionError) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: session.message }))
        return
      }

      // Set the session cookie
      res.setHeader("Set-Cookie", serializeCookie("session", session.id))

      const redirectUrl = new URL(redirect)
      redirectUrl.searchParams.append("token", session.id)
      res.writeHead(302, { Location: redirectUrl.toString() })
      res.end()
      return
    }

    // Direct Login - POST /login/:provider
    if (
      req.method === "POST" &&
      /^\/auth\/login\/(github|google|apple)$/.test(url.pathname)
    ) {
      const provider = url.pathname.split("/")[3] as OAuthProvider
      const body = OAuthLoginBody.safeParse(await req.json())
      if (!body.success) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Invalid request" }))
        return
      }
      const idToken = body.data.idToken
      const sessionToken = body.data.sessionToken

      let session: CreateSessionError | Session
      switch (provider) {
        case "github":
          session = await createGithubSession(idToken, sessionToken)
          break
        case "google":
          session = await createGoogleSession(idToken, "", sessionToken)
          break
        case "apple":
          session = await createAppleSession({
            idToken,
            user: body.data.user,
            sessionToken,
          })
          break
      }

      if (session instanceof CreateSessionError) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: session.message }))
        return
      }

      // Set session cookie
      res.setHeader("Set-Cookie", serializeCookie("session", session.id))

      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ token: session.id }))
      return
    }

    // Logout - POST /logout
    if (req.method === "POST" && url.pathname === "/auth/logout") {
      const authHeader = req.headers.get("authorization")
      const token = authHeader?.split(" ")[1]
      if (!token) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Invalid request" }))
        return
      }
      const session = await sessionService.validateSessionToken(token)

      if (session instanceof InvalidSessionError) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: "Not logged in" }))
        return
      }

      await sessionService.invalidateSession(session.session.id)

      // Clear session cookie
      res.setHeader("Set-Cookie", serializeCookie("session", "", { maxAge: 0 }))

      res.writeHead(200).end()
      return
    }

    // 404 for unmatched routes
    res.writeHead(404).end("Not Found")
  } catch (error) {
    console.error(error)
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Internal Server Error" }))
  }
}
