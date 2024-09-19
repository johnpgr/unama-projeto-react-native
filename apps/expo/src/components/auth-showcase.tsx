import { Pressable, Text } from "react-native"

import { useSignOut, useSession } from "~/utils/auth"

export function AuthShowcase() {
    const user = useSession()
    const signOut = useSignOut()

    return (
        <>
            <Text className="text-white pb-2 text-center text-xl font-semibold">
                {user?.fullName ?? "Not logged in"}
            </Text>
            {user ? (
                <Pressable onPress={() => signOut()}>
                    <Text className="font-medium text-white">Sign out</Text>
                </Pressable>
            ) : null}
        </>
    )
}
