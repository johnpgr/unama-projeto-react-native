/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, Text, View } from "react-native"
import { Link, Redirect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { useSession } from "~/hooks/auth"

export default function OnboardingScreen() {
  const { data, isLoading } = useSession()
  if (isLoading) return null
  if (data.session) return <Redirect href={"/"} />

  return (
    <View className="flex h-full w-full flex-1 flex-col items-center bg-background bg-white p-8 pb-8">
      <View className="flex flex-col items-center">
        <Image
          source={require("../../assets/icon.png")}
          className="h-32 w-32"
          resizeMode="contain"
        />
        <Text className="text-center text-xl font-medium">
          A cada ação, você ganha pontos que podem ser trocados por recompensas.
          Mas o maior prêmio é contribuir para um planeta mais verde e saudável.
        </Text>
        <View className="flex flex-row gap-4">
          <Image
            source={require("../../assets/image 1.jpg")}
            className="h-96 w-48"
            resizeMode="contain"
          />
          <Image
            source={require("../../assets/image 2.jpg")}
            className="h-96 w-48"
            resizeMode="contain"
          />
        </View>
        <Text className="text-center text-xl font-medium">
          Juntos, podemos fazer a diferença no combate às mudanças climáticas.
        </Text>
      </View>
      <View className="mt-auto flex w-full flex-row items-center justify-between">
        <Image
          source={require("../../assets/translate_swap.png")}
          className="h-12 w-12"
          resizeMode="contain"
        />
        <Link href="/signin">
          <View className="flex flex-row items-center justify-center rounded-[2rem] bg-primary p-4">
            <Text className="text-lg font-medium text-white">
              Vamos Começar
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={24}
              color={"white"}
            />
          </View>
        </Link>
      </View>
    </View>
  )
}
