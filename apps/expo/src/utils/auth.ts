import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import * as Browser from "expo-web-browser"
import type {signInSchema, signUpSchema} from "@projeto/validation"

import { api } from "./api"
import { deleteToken, getToken, setToken } from "./session-store"
import type { z } from "zod"

export type OAuthAccountProvider = "google" | "apple" | "github"

export type SignInParams = z.infer<typeof signInSchema>

export type SignUpParams = z.infer<typeof signUpSchema>

export function useSession() {
    const { data, status } = api.auth.getSession.useQuery()
    console.log(data)
    return { data: data ?? {user: null, session: null}, status }
}

export function useSignUp() {
    const utils = api.useUtils()
    const router = useRouter()
    const signUpMut = api.auth.signUp.useMutation()

    async function signUp(params: SignUpParams) {
        try {
            const res = await signUpMut.mutateAsync(params)
            setToken(res.session.id)
            await utils.invalidate()
            router.replace("/")
        } catch (error) {
            console.error(error)
            if (error instanceof Error) console.error(error.stack)
        }
    }

    return {
        signUp,
        error: signUpMut.error,
        data: signUpMut.data,
        status: signUpMut.status,
    }
}

export function useSignIn() {
    const utils = api.useUtils()
    const router = useRouter()
    const signInMut = api.auth.signIn.useMutation()

    async function signIn(params: SignInParams) {
        try {
            const res = await signInMut.mutateAsync(params)
            setToken(res.session.id)
            await utils.invalidate()
            router.replace("/")
        } catch (error) {
            console.error(error)
            if (error instanceof Error) console.error(error.stack)
        }
    }

    return {
        signIn,
        error: signInMut.error,
        data: signInMut.data,
        status: signInMut.status,
    }
}

export function useSignOut() {
    const utils = api.useUtils()
    const signOut = api.auth.signOut.useMutation()
    const router = useRouter()

    return async () => {
        try {
            await signOut.mutateAsync()
            await deleteToken()
            await utils.invalidate()
            router.replace("/")
        } catch (error) {
            console.error(error)
            if (error instanceof Error) console.error(error.stack)
        }
    }
}

Browser.maybeCompleteAuthSession()

async function signInOAuth(
    provider: OAuthAccountProvider,
    redirect = Linking.createURL(""),
) {
    const signInUrl = new URL(
        `${process.env.EXPO_PUBLIC_REDIRECT_URL}/auth/${provider}?redirect=${redirect}`,
    )
    const storedSessionToken = getToken()
    if (storedSessionToken) {
        signInUrl.searchParams.append("sessionToken", storedSessionToken)
    }
    const result = await Browser.openAuthSessionAsync(
        signInUrl.toString(),
        redirect,
    )
    if (result.type !== "success") {
        return
    }
    const url = Linking.parse(result.url)
    const sessionToken = url.queryParams?.token?.toString()
    if (!sessionToken) {
        return
    }
    setToken(sessionToken)
}

export function useSignInOAuth() {
    const utils = api.useUtils()
    const router = useRouter()

    return async (...params: Parameters<typeof signInOAuth>) => {
        await signInOAuth(...params)
        await utils.invalidate()
        router.replace("/")
    }
}
