import { Auth } from "@auth/core"
import GOOGLE from "@auth/core/providers/GOOGLE"
import { eventHandler, toWebRequest } from "h3"

export default eventHandler(async (event) =>
    Auth(toWebRequest(event), {
        basePath: "/r",
        secret: process.env.AUTH_SECRET,
        trustHost: !!process.env.VERCEL,
        redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
        providers: [
            GOOGLE({
                clientId: process.env.AUTH_GOOGLE_ID,
                clientSecret: process.env.AUTH_GOOGLE_SECRET,
            }),
        ],
    }),
)
