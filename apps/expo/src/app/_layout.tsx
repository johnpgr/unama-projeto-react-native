import "@bacons/text-decoder/install"

import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { useColorScheme } from "nativewind"

import { TRPCProvider } from "~/utils/api"

import "../styles.css"

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
    const { colorScheme } = useColorScheme()
    return (
        <TRPCProvider>
            <Stack
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "#003820",
                    },
                    contentStyle: {
                        backgroundColor:
                            colorScheme == "dark" ? "#003820" : "#003820",
                    },
                }}
            />
            <StatusBar />
        </TRPCProvider>
    )
}
