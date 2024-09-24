import { Google } from "arctic"

export const googleAuth = new Google(
    process.env.AUTH_GOOGLE_ID,
    process.env.AUTH_GOOGLE_SECRET,
    process.env.API_URL + "/auth/callback/google",
)

export const GOOGLE_STATE = "google_oauth_state"
export const GOOGLE_CODE_VERIFIER = "google_oauth_state"

export interface GoogleOAuthUser {
    id: string
    email: string
    verified_email: string
    name: string
    given_name: string
    picture: string
    locale: string
}

export function isGoogleOAuthUser(input: unknown): input is GoogleOAuthUser {
    return (
        typeof input === "object" &&
        input !== null &&
        typeof (input as GoogleOAuthUser).id === "string" &&
        typeof (input as GoogleOAuthUser).email === "string" &&
        typeof (input as GoogleOAuthUser).verified_email === "string" &&
        typeof (input as GoogleOAuthUser).name === "string" &&
        typeof (input as GoogleOAuthUser).given_name === "string" &&
        typeof (input as GoogleOAuthUser).picture === "string" &&
        typeof (input as GoogleOAuthUser).locale === "string"
    )
}
