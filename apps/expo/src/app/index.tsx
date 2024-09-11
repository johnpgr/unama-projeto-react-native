import { Link, Stack } from "expo-router"
import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AuthButton } from "../components/auth-button"

export default function Index() {
    return (
        <SafeAreaView className="bg-background">
            {/* Changes page title visible on the header */}
            <Stack.Screen options={{ title: "Home" }} />
            <View className="h-full w-full bg-background p-4">
                <Link href="/registro" className="p-4 rounded bg-green-900 text-white font-bold text-center">Tela de registro</Link>
            </View>
        </SafeAreaView>
    )
}
