import type { PropsWithChildren } from "react"
import React from "react"

import type { schema } from "@projeto/api"

import { api } from "~/utils/api"

export interface IAuthContext {
  session: schema.Session | null
  user: schema.User | null
  isPending: boolean
}

export const AuthContext = React.createContext<IAuthContext | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending } = api.auth.getSession.useQuery()

  return (
    <AuthContext.Provider
      value={{
        session: data?.session ?? null,
        user: data?.user ?? null,
        isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
