import "@bacons/text-decoder/install"

import { Stack } from "expo-router"
import { AntDesign, Ionicons } from "@expo/vector-icons"

import { TRPCProvider } from "~/utils/api"

import "../styles.css"

import { Text, View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"

import { useSession } from "~/utils/auth"

function HomeHeader() {
    const { data } = useSession()
    if (!data?.user) return null

    return (
        <SafeAreaView>
            <View className="flex flex-row items-center justify-between p-4">
                <Text className="text-xl font-bold">ECOPoints</Text>
                <View className="flex flex-row items-center gap-4">
                    <AntDesign name="search1" size={24} />
                    <Ionicons name="notifications-outline" size={26} />
                </View>
            </View>
        </SafeAreaView>
    )
}

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
    return (
        <TRPCProvider>
            <SafeAreaProvider>
                <HomeHeader />
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: {
                            backgroundColor: "#ffffff",
                        },
                    }}
                />
            </SafeAreaProvider>
        </TRPCProvider>
    )
}
