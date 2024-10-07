import React from "react"
import {
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Link } from "expo-router"

import {
  getUserTransactions,
  useGetUserInformations,
} from "~/utils/transaction"

const notifications: {
  id: number
  points: number
  transactionDate: string | null
  from: string
  to: string
}[] = []
const months: Record<string, string> = {
  "1": "Janeiro",
  "2": "Fevereiro",
  "3": "Março",
  "4": "Abril",
  "5": "Maio",
  "6": "Junho",
  "7": "Julho",
  "8": "Agosto",
  "9": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
}

export default function ChatScreen() {
  const userInfo = useGetUserInformations().data
  const userTransaction = getUserTransactions().data
  userTransaction?.forEach((element) => {
    const exists = notifications.find(
      (notification) => notification.id === element.id,
    )

    if (!exists) {
      notifications.push(element)
    }
  })
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="items-center rounded-xl bg-emerald-700 p-4">
          <Text className="text-lg text-white">Pontuação atual</Text>
          <Text className="text-6xl font-bold text-white">
            {userInfo?.points}
          </Text>
        </View>

        <View className="my-4 flex-row justify-around">
          <TouchableOpacity className="rounded-lg bg-gray-200 p-3">
            <Link href={"/my-code"}>Receber</Link>
          </TouchableOpacity>
          <TouchableOpacity className="rounded-lg bg-gray-200 p-3">
            <Link href={"/send-points"}>Enviar</Link>
          </TouchableOpacity>
          <TouchableOpacity className="rounded-lg bg-gray-200 p-3">
            <Link href={"/chat"}>Resgatar</Link>
          </TouchableOpacity>
        </View>

        <View className="rounded-t-xl bg-emerald-900 p-4">
          <Text className="text-xl text-white">Histórico</Text>
        </View>

        <View className="bg-white shadow-sm">
          {notifications.length === 0 ? (
            <View className="p-4">
              <Text className="text-center text-gray-500">
                You don't have any notifications yet
              </Text>
            </View>
          ) : (
            notifications.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between border-b border-gray-200 p-4"
              >
                <View>
                  <Text className="text-base">{item.points} pontos</Text>
                  <Text className="text-gray-500">
                    Data:{" "}
                    {`${item.transactionDate?.split("-")[2]} de ${months[item.transactionDate?.split("-")[1] ?? ""]} de ${item.transactionDate?.split("-")[0]}`}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-emerald-700">→</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
