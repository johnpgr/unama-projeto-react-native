import { Stack } from "expo-router"
import { Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { AuthButton } from "../components/auth-button"

export default function Index() {
    return (
        <SafeAreaView className="bg-background">
            {/* Changes page title visible on the header */}
            <Stack.Screen options={{ title: "Home Page" }} />
            <View className="h-full w-full bg-background p-4">
                <Text className="pb-2 text-center text-5xl font-bold text-foreground">
                    Hello, World!
                </Text>
                <AuthButton />
            </View>
        </SafeAreaView>
    )
}
