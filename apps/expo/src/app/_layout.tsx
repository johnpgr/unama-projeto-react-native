import "@bacons/text-decoder/install"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { TRPCProvider } from "~/utils/api"

import "../styles.css"

import { SafeAreaProvider } from "react-native-safe-area-context"
import { useColorScheme } from "nativewind"

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const { colorScheme } = useColorScheme()

  return (
    <TRPCProvider>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor:
                //TODO: Find a way to avoid hardcoding this.
                //I need to find a way to give the layout the className bg-background
                colorScheme === "dark"
                  ? "hsl(240, 10%, 3.9%)"
                  : "hsl(0, 0%, 100%)",
            },
          }}
        />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </TRPCProvider>
  )
}
