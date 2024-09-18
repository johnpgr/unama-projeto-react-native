import { View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Image } from "expo-image"
import { Link, Stack } from "expo-router"
import Icon from "../../assets/icon.png"

import { useSignIn } from "~/utils/auth"

export default function Index() {
    const signIn = useSignIn()

    return (
        <SafeAreaView className="bg-background">
            {/* Changes page title visible on the header */}
            <Stack.Screen options={{ title: "Home" }} />
            <View className="h-full w-full bg-primary p-4">
                <Image source={Icon.src} className="w-40 h-64"/>
                <Link
                    href="/login"
                    className="rounded-xl bg-white p-4 py-2 text-center"
                >
                    Sign in
                </Link>
                <Link
                    href="/registro"
                    className="rounded-xl bg-white p-4 py-2 text-center"
                >
                    Sign up
                </Link>
            </View>
        </SafeAreaView>
    )
}
