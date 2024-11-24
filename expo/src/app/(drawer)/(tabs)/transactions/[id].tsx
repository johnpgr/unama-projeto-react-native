import React from "react"
import { ActivityIndicator, Pressable, Text, View } from "react-native"
import { Link, useLocalSearchParams, useRouter } from "expo-router"

import { useAuth } from "~/hooks/auth"
import { api } from "~/utils/api"
import { formatDatePTBR } from "~/utils/date"

export default function TransactionDetailPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { id, type } = useLocalSearchParams<"/transactions/[id]", { type: "p2p" | "recycling" }>()
  const { data: transaction, isPending } = api.transaction.getTransactionDetails.useQuery({
    id,
    type,
  })

  const isP2P = transaction?.type === "p2p"
  const isSender = isP2P && user?.id === transaction.from

  const { data: counterPartyUserInfo } = api.user.getPublicUserInfo.useQuery(
    { userId: isP2P ? (isSender ? transaction.to : transaction.from) : "" },
    {
      enabled: transaction !== undefined && isP2P,
    },
  )

  if (isPending) {
    return (
      <View className="flex flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#02391E" />
      </View>
    )
  } else if (!transaction) {
    return (
      <View className="flex flex-1 items-center justify-center">
        <Text className="text-lg font-bold">Transação não encontrada</Text>
      </View>
    )
  }

  return (
    <View className="flex flex-1 flex-col items-center gap-8 bg-background pt-4">
      <View className="flex w-full flex-col gap-4">
        <View className="flex flex-row items-center justify-between p-4">
          <Text className="text-lg font-medium">Pontos</Text>
          <Text>{transaction.points} ECOPoints</Text>
        </View>
        <View className="flex flex-row items-center justify-between p-4">
          <Text className="text-lg font-medium">Tipo da transação</Text>
          <Text>{transaction.type === "p2p" ? "Transferência de pontos" : "Reciclagem"}</Text>
        </View>
        <View className="flex flex-row items-center justify-between p-4">
          <Text className="text-lg font-medium">Data da transação</Text>
          <Text>{formatDatePTBR(transaction.createdAt)}</Text>
        </View>
        {isP2P ? (
          <View className="flex flex-row items-center justify-between p-4">
            <Text className="text-lg font-medium">
              {isSender ? "Enviados para" : "Recebidos de"}
            </Text>
            <Text>{counterPartyUserInfo?.fullName}</Text>
          </View>
        ) : (
          <>
            <View className="flex flex-row items-center justify-between p-4">
              <Text className="text-lg font-medium">Material</Text>
              <Text>{transaction.material}</Text>
            </View>
            <View className="flex flex-row items-center justify-between p-4">
              <Text className="text-lg font-medium">Peso</Text>
              <Text>{transaction.weight}kg</Text>
            </View>
          </>
        )}
        {transaction.description ? (
          <View className="flex flex-row items-center justify-between p-4">
            <Text className="text-lg font-medium">Descrição</Text>
            <Text>{transaction.description}</Text>
          </View>
        ) : null}
      </View>

      <Link asChild href="/points">
        <Pressable className="max-w-48 rounded-md bg-neutral-300 p-4 px-8 transition-colors active:bg-neutral-400/80">
          <Text className="text-center">Ver meus pontos</Text>
        </Pressable>
      </Link>
    </View>
  )
}
