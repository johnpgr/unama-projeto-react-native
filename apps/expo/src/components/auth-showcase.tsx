import { Pressable, Text, View } from "react-native"
import { Link } from "expo-router"

import { useSignOut, useUser } from "~/utils/auth"

export function AuthShowcase() {
    const user = useUser()
    const signOut = useSignOut()

    return (
        <>
            <Text className="pb-2 text-center text-xl font-semibold">
                {user?.name ?? "Not logged in"}
            </Text>
            {!user ? (
                <View className="flex flex-row items-center justify-center gap-2">
                    <Link
                        className="font-medium text-green-900"
                        href="/registro"
                    >
                        Sign up
                    </Link>
                    <Link className="font-medium text-green-900" href="/login">
                        Sign in
                    </Link>
                </View>
            ) : (
                <Pressable onPress={() => signOut()}>
                    <Text className="font-medium text-green-900">Sign out</Text>
                </Pressable>
            )}
        </>
    )
}
