import { useSignIn, useSignOut, useUser } from "~/utils/auth"
import { Button, Text } from "react-native"

export function AuthButton() {
    const user = useUser()
    const signIn = useSignIn()
    const signOut = useSignOut()

    return (
        <>
            <Text className="pb-2 text-center text-xl font-semibold text-white">
                {user?.name ?? "Not logged in"}
            </Text>
            <Button
                onPress={() => (user ? signOut() : signIn())}
                title={user ? "Sign Out" : "Sign In With GOOGLE"}
                color={"#5B65E9"}
            />
        </>
    )
}
