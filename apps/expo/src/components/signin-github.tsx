/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, Pressable } from "react-native"

import { useSignInOAuth } from "~/utils/auth"

export function GithubSignInButton() {
    const signIn = useSignInOAuth()

    return (
        <Pressable onPress={() => signIn("github")}>
            <Image
                source={require("../../assets/logo_github.png")}
                className="h-8 w-8"
            />
        </Pressable>
    )
}
