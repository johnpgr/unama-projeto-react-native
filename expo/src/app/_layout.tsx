import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { TRPCProvider } from "~/utils/api"

import "../styles.css"

import React from "react"

import { AuthProvider } from "~/state/auth-context"

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  return (
    <TRPCProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            statusBarStyle: "dark",
          }}
        />
        <StatusBar style="auto" />
      </AuthProvider>
    </TRPCProvider>
  )
}
