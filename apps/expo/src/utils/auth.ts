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
    const { data, status } = api.auth.getSession.useQuery()
    return { data: data ?? null, status }
}

export function useSignUp() {
    const utils = api.useUtils()
    const router = useRouter()
    const { mutateAsync, error, data, status } = api.auth.signUp.useMutation()

    async function signUp(params: SignUpParams) {
        const res = await mutateAsync(params)
        setToken(res.session.id)
        await utils.invalidate()
        router.replace("/")
    }

    return { signUp, error, data, status }
}

export function useSignIn() {
    const utils = api.useUtils()
    const router = useRouter()
    const { mutateAsync, error, data, status } = api.auth.signIn.useMutation()

    async function signIn(params: SignInParams) {
        const res = await mutateAsync(params)
        setToken(res.session.id)
        await utils.invalidate()
        router.replace("/")
    }

    return { signIn, error, data, status }
}

export function useSignOut() {
    const utils = api.useUtils()
    const { mutateAsync, error, data, status } = api.auth.signOut.useMutation()
    const router = useRouter()

    async function signOut() {
        const res = await mutateAsync()
        if (!res.success) return
        await deleteToken()
        await utils.invalidate()
        router.replace("/")
    }

    return { signOut, error, data, status }
}
