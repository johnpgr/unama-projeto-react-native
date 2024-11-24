import type http from "http"
import { incomingMessageToRequest } from "@trpc/server/adapters/node-http"
import { generateCodeVerifier, generateState } from "arctic"
import cookie from "cookie"
import { z } from "zod"

import type { CreatedSession } from "./types.ts"
import { env } from "../../../config/env.ts"
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
  user: z
    .object({
      fullName: z.string(),
    })
    .optional(),
  sessionToken: z.string().optional(),
})

type OAuthProvider = "github" | "google" | "apple"

const COOKIE_OPTS = {
  httpOnly: true,
  maxAge: 60 * 30,
  path: "/",
  secure: process.env.NODE_ENV === "production",
} satisfies cookie.SerializeOptions

function setCookie(
  res: http.ServerResponse,
  name: string,
  value: string,
  opts?: cookie.SerializeOptions,
) {
  res.appendHeader("Set-Cookie", cookie.serialize(name, value, { ...COOKIE_OPTS, ...opts }))
}

function redirect(res: http.ServerResponse, path: string | URL) {
  res.writeHead(302, { Location: path instanceof URL ? path.toString() : path }).end()
}

function json<T>(
  res: http.ServerResponse,
  data: T,
  opts?: { status?: number; headers?: http.OutgoingHttpHeaders },
) {
  res.writeHead(opts?.status ?? 200, {
    ...(opts?.headers ?? {}),
    "Content-Type": "application/json",
  })
  res.end(JSON.stringify(data, null, 2))
}

export async function handleOAuthRequest(inc: http.IncomingMessage, res: http.ServerResponse) {
  const req = incomingMessageToRequest(inc, res, { maxBodySize: 20_000 })
  const host = req.headers.get("host")
  const isHTTPS = req.headers.get("x-forwarded-proto") === "https"
  const base = `${isHTTPS ? "https" : "http"}://${host}`
  const url = new URL(req.url, host ? base : "http://127.0.0.1")

  // OAuth Login Routes - GET /:provider
  if (req.method === "GET" && /^\/oauth\/(github|google|apple)$/.test(url.pathname)) {
    const provider = url.pathname.split("/")[2] as OAuthProvider
    const redirectUrl = url.searchParams.get("redirect") ?? "http://localhost:8081"
    const sessionToken = url.searchParams.get("sessionToken")

    setCookie(res, "redirect", redirectUrl)

    if (sessionToken) {
      const session = await sessionService.validateSessionToken(sessionToken)

      if (!(session instanceof InvalidSessionError)) {
        setCookie(res, "sessionToken", sessionToken)
      }
    }

    const state = generateState()

    switch (provider) {
      case "github": {
        const url = await getGithubAuthorizationUrl(state)

        setCookie(res, "github_oauth_state", state)

        return redirect(res, url)
      }

      case "google": {
        const codeVerifier = generateCodeVerifier()
        const url = await getGoogleAuthorizationUrl(state, codeVerifier)

        setCookie(res, "google_oauth_state", state)
        setCookie(res, "google_oauth_code_verifier", codeVerifier)

        return redirect(res, url)
      }

      case "apple": {
        const url = await getAppleAuthorizationUrl(state)

        setCookie(res, "apple_oauth_state", state)

        return redirect(res, url)
      }
    }
  }

  // OAuth Callback Routes - POST|GET /:provider/callback
  if (/^\/oauth\/(github|google|apple)\/callback$/.test(url.pathname)) {
    const cookies = cookie.parse(req.headers.get("cookie") ?? "")
    const provider = url.pathname.split("/")[2] as OAuthProvider
    let stateCookie = cookies[`${provider}_oauth_state`]
    const codeVerifierCookie = cookies[`${provider}_oauth_code_verifier`]
    const sessionTokenCookie = cookies.sessionToken
    let redirectCookie = cookies.redirect

    let state = url.searchParams.get("state")
    let code = url.searchParams.get("code")

    const codeVerifierRequired = provider === "google"

    if (req.method === "POST") {
      const formData = await req.formData()
      state = formData.get("state")?.toString() ?? null
      stateCookie = state ?? stateCookie
      code = formData.get("code")?.toString() ?? code
      redirectCookie = env.APP_URL
    }

    if (
      !state ||
      !stateCookie ||
      !code ||
      stateCookie !== state ||
      !redirectCookie ||
      (codeVerifierRequired && !codeVerifierCookie)
    ) {
      return json(res, {
        error: "Invalid request (Incorrect OAuth state)",
        cookies,
        variables: {
          provider,
          state: state ?? "",
          code: code ?? "",
          stateCookie: stateCookie ?? "",
          redirectCookie: redirectCookie ?? "",
          codeVerifierCookie: codeVerifierCookie ?? "",
        },
      })
    }

    switch (provider) {
      case "github": {
        const sessionRes = await createGithubSession(code, sessionTokenCookie)

        if (sessionRes instanceof CreateSessionError) {
          return json(res, { error: sessionRes.message }, { status: 400 })
        }

        const url = new URL(redirectCookie)

        url.searchParams.append("token", sessionRes.token)

        return redirect(res, url)
      }

      case "google": {
        if (!codeVerifierCookie) {
          return json(res, { error: "Invalid request (Missing google code verifier)" })
        }

        const sessionRes = await createGoogleSession(code, codeVerifierCookie, sessionTokenCookie)

        if (sessionRes instanceof CreateSessionError) {
          return json(res, { error: sessionRes.message }, { status: 400 })
        }

        const url = new URL(redirectCookie)

        url.searchParams.append("token", sessionRes.token)

        return redirect(res, url)
      }

      case "apple": {
        const originHeader = req.headers.get("origin") ?? ""
        const hostHeader = req.headers.get("host") ?? ""

        if (
          !originHeader ||
          !hostHeader ||
          !verifyRequestOrigin(originHeader, [hostHeader, "appleid.apple.com"])
        ) {
          return json(res, { error: "Unauthorized" }, { status: 403 })
        }

        const formData = await req.formData()
        const userJSON = formData.get("user")

        let user: { fullName: string } | undefined

        if (userJSON) {
          const userData = AppleUserObj.safeParse(JSON.parse(userJSON as string))

          if (!userData.success) {
            return json(res, { error: "Invalid request (Invalid user data)" }, { status: 400 })
          }

          user = {
            fullName: `${userData.data.name.firstName} ${userData.data.name.lastName}`,
          }
        }

        const sessionRes = await createAppleSession({
          code,
          user,
          sessionToken: sessionTokenCookie,
        })

        if (sessionRes instanceof CreateSessionError) {
          return json(res, { error: sessionRes.message }, { status: 400 })
        }

        const url = new URL(redirectCookie)
        url.searchParams.append("token", sessionRes.token)
        return redirect(res, url)
      }
    }
  }

  // Direct Login - POST /login/:provider
  if (req.method === "POST" && /^\/oauth\/login\/(github|google|apple)$/.test(url.pathname)) {
    const body = OAuthLoginBody.safeParse(await req.json())

    if (!body.success) {
      res.writeHead(400, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ error: "Invalid request" }))
      return
    }

    const provider = url.pathname.split("/")[3] as OAuthProvider

    let session: CreateSessionError | CreatedSession

    switch (provider) {
      case "github": {
        session = await createGithubSession(body.data.idToken, body.data.sessionToken)

        break
      }

      case "google": {
        session = await createGoogleSession(body.data.idToken, "", body.data.sessionToken)

        break
      }

      case "apple": {
        session = await createAppleSession(body.data)

        break
      }
    }

    if (session instanceof CreateSessionError) {
      return json(res, { error: session.message }, { status: 400 })
    }

    return json(res, { token: session.token })
  }

  // Logout - POST /logout
  if (req.method === "POST" && url.pathname === "/auth/logout") {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    if (!token) {
      return json(
        res,
        { error: "Invalid request (Authorization header not found)" },
        { status: 400 },
      )
    }

    const session = await sessionService.validateSessionToken(token)

    if (session instanceof InvalidSessionError) {
      return json(res, { error: "Invalid request (Not signed in)" }, { status: 400 })
    }

    await sessionService.invalidateSession(session.session.id)

    return res.writeHead(200).end()
  }

  // 404 for unmatched routes
  res.writeHead(404).end("Not Found")
}
