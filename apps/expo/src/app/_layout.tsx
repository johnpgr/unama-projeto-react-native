import "@bacons/text-decoder/install"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { TRPCProvider } from "~/utils/api"

import "../styles.css"

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  return (
    <TRPCProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          statusBarStyle: "dark",
        }}
      />
      <StatusBar style="auto" />
    </TRPCProvider>
  )
}
