import { Pressable, Text, View } from "react-native"

import { GithubSignInButton } from "./signin-github"
import { GoogleSignInButton } from "./signin-google"

export function SigninOAuthButtons() {
    return (
        <View className="flex flex-row gap-2 py-4">
            <Pressable className="w-[49%] border rounded-2xl border-border/50 px-4 py-2 flex flex-row items-center justify-center gap-2">
                <Text className="text-border">Entrar com</Text>
                <GoogleSignInButton />
            </Pressable>
            <Pressable className="w-[49%] border rounded-2xl border-border/50 px-4 py-2 flex flex-row items-center justify-center gap-2">
                <Text className="text-border">Entrar com</Text>
                <GithubSignInButton />
            </Pressable>
        </View>
    )
}
