import "@bacons/text-decoder/install"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"

import { TRPCProvider } from "~/utils/api"

import "../styles.css"

import { SafeAreaProvider } from "react-native-safe-area-context"

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
    return (
        <TRPCProvider>
            <SafeAreaProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: {
                            backgroundColor: "#ffffff",
                        },
                    }}
                />
                <StatusBar />
            </SafeAreaProvider>
        </TRPCProvider>
    )
}
