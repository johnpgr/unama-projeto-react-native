import type { z } from "zod"
import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import * as Browser from "expo-web-browser"

import type { signInSchema, signUpSchema } from "@projeto/validation"

import { api } from "../utils/api"
import { deleteToken, getToken, setToken } from "../utils/session-store"

export type OAuthAccountProvider = "google" | "apple" | "github"

export type SignInParams = z.infer<typeof signInSchema>

export type SignUpParams = z.infer<typeof signUpSchema>

export function useSession() {
  const { data, isLoading } = api.auth.getSession.useQuery()
  return { data: data ?? { user: null, session: null }, isLoading }
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
    isPending: signUpMut.isPending,
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
    isPending: signInMut.isPending,
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
    console.error(
      "Oauth signin failed (Browser auth session returned result was not successfull)",
    )
    return { success: false, token: null } as const
  }
  const url = Linking.parse(result.url)
  const sessionToken = url.queryParams?.token?.toString()
  if (!sessionToken) {
    console.error(
      "Oauth signin failed (Session token not found in callback url)",
    )
    return { success: false, token: null } as const
  }

  return { success: true, token: sessionToken } as const
}

export function useSignInOAuth() {
  const utils = api.useUtils()
  const router = useRouter()

  return async (...params: Parameters<typeof signInOAuth>) => {
    const { success, token } = await signInOAuth(...params)
    if (!success) return
    setToken(token)
    await utils.invalidate()
    router.replace("/")
  }
}
