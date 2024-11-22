/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, Pressable, Text, View } from "react-native"

import { useOAuthSignIn } from "~/hooks/auth"

export function SigninOAuthButtons() {
  const signIn = useOAuthSignIn()

  return (
    <View className="flex flex-row gap-2 py-4">
      <Pressable
        onPress={() => signIn("google")}
        className="flex w-[49%] flex-row items-center justify-center gap-2 rounded-2xl border border-border/50 px-4 py-2 transition-colors active:bg-border/50"
      >
        <Text className="text-border">Entrar com</Text>
        <Image source={require("../../../assets/logo_google.png")} className="h-8 w-8" />
      </Pressable>
      <Pressable
        onPress={() => signIn("github")}
        className="flex w-[49%] flex-row items-center justify-center gap-2 rounded-2xl border border-border/50 px-4 py-2 transition-colors active:bg-border/50"
      >
        <Text className="text-border">Entrar com</Text>
        <Image source={require("../../../assets/logo_github.png")} className="h-8 w-8" />
      </Pressable>
    </View>
  )
}
