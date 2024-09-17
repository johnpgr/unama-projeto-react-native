import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, Stack } from "expo-router"

export default function Index() {
    return (
        <SafeAreaView className="bg-background">
            {/* Changes page title visible on the header */}
            <Stack.Screen options={{ title: "Home" }} />
            <View className="h-full w-full bg-background p-4">
                <Link
                    href="/registro"
                    className="rounded bg-blue-900 p-4 text-center font-bold text-white"
                >
                    Tela de registro
                </Link>
            </View>
        </SafeAreaView>
    )
}
