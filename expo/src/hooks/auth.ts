import type { z } from "zod"
import React from "react"
import * as Linking from "expo-linking"
import { useRouter } from "expo-router"
import * as Browser from "expo-web-browser"

import type { LoginSchema, RegisterSchema } from "@projeto/api"

import { AuthContext } from "~/state/auth-context"
import { api } from "~/utils/api"
import { unreachable } from "~/utils/unreachable"
import { deleteToken, getToken, setToken } from "../utils/session-store"

export type OAuthAccountProvider = "google" | "apple" | "github"
export type LoginSchemaParams = z.infer<typeof LoginSchema>
export type RegisterSchemaParams = z.infer<typeof RegisterSchema>

export function useAuth() {
  const ctx =
    React.useContext(AuthContext) ??
    unreachable("useAuth must be used inside an AuthProvider")

  return ctx
}

export function useSignIn() {
  const utils = api.useUtils()
  const router = useRouter()

  const signInMutation = api.auth.signIn.useMutation({
    onSuccess: async (res) => {
      setToken(res.session.token)
      await utils.invalidate()
      router.replace("/(tabs)")
    },
  })

  return {
    signIn: signInMutation.mutateAsync,
    isPending: signInMutation.isPending,
    error: signInMutation.error,
  } as const
}

export function useSignUp() {
  const utils = api.useUtils()
  const router = useRouter()

  const signUpMutation = api.auth.signUp.useMutation({
    onSuccess: async (res) => {
      setToken(res.session.token)
      await utils.invalidate()
      router.replace("/(tabs)")
    },
  })

  return {
    signUp: signUpMutation.mutateAsync,
    isPending: signUpMutation.isPending,
    error: signUpMutation.error,
  } as const
}

export function useSignOut() {
  const utils = api.useUtils()
  const router = useRouter()

  const signOutMutation = api.auth.signOut.useMutation({
    onSuccess: async () => {
      await deleteToken()
      await utils.invalidate()
      router.replace("/(tabs)")
    },
  })

  return {
    signOut: signOutMutation.mutateAsync,
    isPending: signOutMutation.isPending,
    error: signOutMutation.error,
  } as const
}

export function useOAuthSignIn() {
  const utils = api.useUtils()
  const router = useRouter()

  return async (...params: Parameters<typeof handleOAuthSignin>) => {
    const { success, token } = await handleOAuthSignin(...params)
    if (!success) return
    setToken(token)
    await utils.invalidate()
    router.replace("/(tabs)")
  }
}

async function handleOAuthSignin(
  provider: OAuthAccountProvider,
  redirect = Linking.createURL(""),
) {
  Browser.maybeCompleteAuthSession()
  const signInUrl = new URL(
    `${process.env.EXPO_PUBLIC_API_URL}/auth/${provider}?redirect=${redirect}`,
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
