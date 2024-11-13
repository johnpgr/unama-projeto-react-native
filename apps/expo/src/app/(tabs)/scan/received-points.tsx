/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, Pressable, Text, View } from "react-native"
import { useLocalSearchParams } from "expo-router"

export default function ReceivedPointsScreen() {
  const { points, sender } = useLocalSearchParams()
  if (!points || !sender) return null
  if (typeof points !== "string") return null
  if (isNaN(parseInt(points))) return null

  return (
    <View className="mt-4 flex flex-1 flex-col px-4">
      <View>
        <Image source={require("../../../../assets/checkmark.png")} />
        <Text>Parabéns! Você recebeu {points} pontos</Text>
      </View>
      <View className="h-[1px] w-full bg-border"></View>
      <View>
        <Text>Detalhes da ação:</Text>
        <Text className="font-bold">DETALHES</Text>
        <View>
          <Pressable>Ver detalhes</Pressable>
          <Pressable>Ver meus pontos</Pressable>
        </View>
      </View>
    </View>
  )
}
