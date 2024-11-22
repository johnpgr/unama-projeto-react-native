import type http from "http"
import { generateCodeVerifier, generateState } from "arctic"
import cookie from "cookie"
import { z } from "zod"

import type { CreatedSession } from "./types.ts"
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

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
} satisfies cookie.SerializeOptions

function setCookie(
  res: http.ServerResponse,
  name: string,
  value: string,
  opts?: cookie.SerializeOptions,
) {
  res.setHeader("Set-Cookie", cookie.serialize(name, value, { ...COOKIE_OPTS, ...opts }))
}

export const handleOAuthRequest = async (url: URL, req: Request, res: http.ServerResponse) => {
  const cookies = cookie.parse(req.headers.get("cookie") ?? "")

  // OAuth Login Routes - GET /:provider
  if (req.method === "GET" && /^\/oauth\/(github|google|apple)$/.test(url.pathname)) {
    const provider = url.pathname.split("/")[2] as OAuthProvider
    const redirect = url.searchParams.get("redirect") ?? "http://localhost:8081"
    const sessionToken = url.searchParams.get("sessionToken")
    const state = generateState()

    setCookie(res, "redirect", redirect)
    setCookie(res, `${provider}_oauth_state`, state)

    if (sessionToken) {
      const session = await sessionService.validateSessionToken(sessionToken)
      if (!(session instanceof InvalidSessionError)) {
        setCookie(res, "sessionToken", sessionToken)
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
        setCookie(res, "google_oauth_code_verifier", codeVerifier)

        break
      }

      case "apple": {
        authUrl = await getAppleAuthorizationUrl(state)

        break
      }
    }
    console.log("response cookies:", res.getHeaders()["set-cookie"])

    res.writeHead(302, { Location: authUrl.toString() })
    res.end()

    return
  }

  // OAuth Callback Routes - POST|GET /:provider/callback
  if (/^\/oauth\/(github|google|apple)\/callback$/.test(url.pathname)) {
    const provider = url.pathname.split("/")[1] as OAuthProvider
    const stateCookie = cookies[`${provider}_oauth_state`]
    const codeVerifier = cookies[`${provider}_oauth_code_verifier`]
    const sessionToken = cookies.sessionToken
    const redirect = cookies.redirect

    console.log({ provider, stateCookie, codeVerifier, sessionToken, redirect })

    // Clear OAuth-related cookies after use
    setCookie(res, `${provider}_oauth_state`, "", { maxAge: 0 })
    setCookie(res, `${provider}_oauth_code_verifier`, "", { maxAge: 0 })
    setCookie(res, "redirect", "", { maxAge: 0 })

    const urlParams = new URLSearchParams(url.search)
    let state: string | null = urlParams.get("state")
    let code: string | null = urlParams.get("code")

    if (req.method === "POST") {
      const formData = await req.formData()
      state = formData.get("state")?.toString() ?? state
      code = formData.get("code")?.toString() ?? code
    }

    if (!state || !stateCookie || !code || stateCookie !== state || !redirect) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify(
          {
            error: "Invalid request (Incorrect OAuth state)",
            variables: { state, stateCookie, code, redirect },
          },
          null,
          2,
        ),
      )

      return
    }

    let result: CreateSessionError | CreatedSession

    switch (provider) {
      case "github": {
        result = await createGithubSession(code, sessionToken)

        break
      }

      case "google": {
        if (!codeVerifier) {
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Invalid request (Missing google code verifier)" }))

          return
        }

        result = await createGoogleSession(code, codeVerifier, sessionToken)

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
          const userData = AppleUserObj.safeParse(JSON.parse(formData.get("user") as string))

          if (!userData.success) {
            res.writeHead(400, { "Content-Type": "application/json" })
            res.end(JSON.stringify({ error: "Invalid request (Invalid user data)" }))

            return
          }

          user = {
            fullName: `${userData.data.name.firstName} ${userData.data.name.lastName}`,
          }
        }

        result = await createAppleSession({ code, user, sessionToken })

        break
      }
    }

    if (result instanceof CreateSessionError) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: result.message }))

      return
    }

    const redirectUrl = new URL(redirect)

    redirectUrl.searchParams.append("token", result.token)
    res.writeHead(302, { Location: redirectUrl.toString() })
    res.end()

    return
  }

  // Direct Login - POST /login/:provider
  if (req.method === "POST" && /^\/oauth\/login\/(github|google|apple)$/.test(url.pathname)) {
    const provider = url.pathname.split("/")[3] as OAuthProvider
    const body = OAuthLoginBody.safeParse(await req.json())

    if (!body.success) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Invalid request" }))
      return
    }

    const idToken = body.data.idToken
    const sessionToken = body.data.sessionToken

    let result: CreateSessionError | CreatedSession

    switch (provider) {
      case "github": {
        result = await createGithubSession(idToken, sessionToken)
        break
      }

      case "google": {
        result = await createGoogleSession(idToken, "", sessionToken)
        break
      }

      case "apple": {
        result = await createAppleSession({
          idToken,
          user: body.data.user,
          sessionToken,
        })
        break
      }
    }

    if (result instanceof CreateSessionError) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: result.message }))
      return
    }

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ token: result.token }))
    return
  }

  // Logout - POST /logout
  if (req.method === "POST" && url.pathname === "/auth/logout") {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Invalid request (Missing token)" }))
      return
    }

    const session = await sessionService.validateSessionToken(token)

    if (session instanceof InvalidSessionError) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Not logged in" }))
      return
    }

    await sessionService.invalidateSession(session.session.id)

    res.writeHead(200).end()

    return
  }

  // 404 for unmatched routes
  res.writeHead(404).end("Not Found")
}
