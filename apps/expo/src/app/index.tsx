import { Image, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, Stack } from "expo-router"
import { AuthShowcase } from "~/components/auth-showcase"

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1">
            {/* Changes page title visible on the header */}
            <Stack.Screen options={{ headerShown: false }} />
            <View className="flex h-full w-full flex-col items-center justify-end pb-8">
                <Image
                    source={require("../../assets/icon.png")}
                    className="h-80 w-80 mb-48"
                    style={{ resizeMode: "contain" }}
                />
                <AuthShowcase/>
                <View className="flex flex-col w-full items-center">
                    <View className="flex w-full flex-row justify-around p-8">
                        <Link
                            href="/signin"
                            className="rounded-3xl bg-white p-12 py-4 text-center"
                        >
                            Sign in
                        </Link>
                        <Link
                            href="/signup"
                            className="rounded-3xl bg-white p-12 py-4 text-center"
                        >
                            Sign up
                        </Link>
                    </View>
                    <Text className="text-white">Português (BR)</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}
