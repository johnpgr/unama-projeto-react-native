import { useRouter } from "expo-router"

import { api } from "./api"
import { deleteToken, setToken } from "./session-store"

export interface SignInParams {
    email: string
    password: string
}

export interface SignUpParams extends SignInParams {
    fullName: string
}

export function useSession() {
    const { data: session } = api.auth.getSession.useQuery()
    return session?.user ?? null
}

export function useSignUp() {
    const utils = api.useUtils()
    const router = useRouter()
    const signup = api.auth.signUp.useMutation()

    return async (params: SignUpParams) => {
        const res = await signup.mutateAsync(params)
        if (!signup.error) {
            console.error(signup.error)
            return
        }
        setToken(res.session.id)
        await utils.invalidate()
        router.replace("/")
    }
}

export function useSignIn() {
    const utils = api.useUtils()
    const router = useRouter()
    const signin = api.auth.signIn.useMutation()

    return async (params: SignInParams) => {
        const res = await signin.mutateAsync(params)
        if (signin.error) {
            console.error(signin.error)
            return
        }
        setToken(res.session.id)
        await utils.invalidate()
        router.replace("/")
    }
}

export function useSignOut() {
    const utils = api.useUtils()
    const signout = api.auth.signOut.useMutation()
    const router = useRouter()

    return async () => {
        const res = await signout.mutateAsync()
        if (!res.success) return
        await deleteToken()
        await utils.invalidate()
        router.replace("/")
    }
}
