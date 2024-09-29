/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react"
import { Image, Pressable } from "react-native"

import { useSignInOAuth } from "~/utils/auth"

export function GoogleSignInButton() {
    const signIn = useSignInOAuth()

    return (
        <Pressable onPress={() => signIn("google")}>
            <Image
                source={require("../../assets/logo_google.png")}
                className="h-8 w-8"
            />
        </Pressable>
    )
}
