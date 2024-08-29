import { Auth } from "@auth/core"
import GoogleProvider from "@auth/core/providers/google"
import { defineEventHandler, toWebRequest } from "h3"

export default defineEventHandler(async (event) =>
    Auth(toWebRequest(event), {
        basePath: "/r",
        secret: process.env.AUTH_SECRET,
        trustHost: !!process.env.VERCEL,
        redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
        providers: [
            GoogleProvider({
                clientId: process.env.AUTH_GOOGLE_ID,
                clientSecret: process.env.AUTH_GOOGLE_SECRET,
            }),
        ],
    }),
)
