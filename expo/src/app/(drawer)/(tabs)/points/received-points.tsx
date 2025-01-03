/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, Pressable, Text, View } from "react-native"
import { Link, useLocalSearchParams } from "expo-router"
import { z } from "zod"

import { api } from "~/utils/api"

export const ReceivedPointsParams = z.object({
  transactionType: z.enum(["p2p", "recycling"]),
  transactionId: z.string(),
  points: z
    .string()
    .transform((it) => parseInt(it))
    .refine((it) => !isNaN(it)),
  sender: z.string().optional(),
})

export default function ReceivedPointsScreen() {
  const params = useLocalSearchParams()
  const parsedParams = ReceivedPointsParams.safeParse(params)
  const { data: senderData } = api.user.getPublicUserInfo.useQuery(
    { userId: parsedParams.data?.sender ?? "" },
    {
      // Enabled only if the sender userID is present
      enabled: Boolean(parsedParams.data?.sender),
    },
  )

  if (!parsedParams.success) return null

  const { points, transactionId, transactionType } = parsedParams.data

  return (
    <View className="flex flex-1 flex-col items-center gap-4 bg-background px-4 pt-4">
      <View className="flex flex-col items-center">
        <Image source={require("../../../../../assets/checkmark.png")} />
        <Text className="text-lg font-medium">
          Parabéns! Você recebeu {points} pontos {senderData ? `de ${senderData.fullName}` : ""}
        </Text>
      </View>
      <View className="h-[1px] w-full bg-border"></View>
      <View className="flex flex-row items-center gap-4">
        <Link asChild href={`/transactions/${transactionId}?type=${transactionType}`}>
          <Pressable className="flex min-w-40 flex-row justify-center rounded-md bg-gray-300 p-4 active:bg-gray-300/90">
            <Text>Ver detalhes</Text>
          </Pressable>
        </Link>
        <Link asChild href="/points">
          <Pressable className="flex min-w-40 flex-row justify-center rounded-md bg-gray-300 p-4 active:bg-gray-300/90">
            <Text>Ver meus pontos</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  )
}
