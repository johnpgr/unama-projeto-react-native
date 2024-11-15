/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, Pressable, Text, View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { z } from "zod"

export const ReceivedPointsParams = z.object({
  points: z
    .string()
    .transform((it) => parseInt(it))
    .refine((it) => !isNaN(it)),
  sender: z.string(),
})

export default function ReceivedPointsScreen() {
  const params = useLocalSearchParams()
  const parsedParams = ReceivedPointsParams.safeParse(params)
  if (!parsedParams.success) return null
  const { points, sender } = parsedParams.data

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
          <Pressable>
            <Text>Ver detalhes</Text>
          </Pressable>
          <Pressable>
            <Text>Ver meus pontos</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}
