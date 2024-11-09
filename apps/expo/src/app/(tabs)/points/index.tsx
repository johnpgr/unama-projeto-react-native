import React, { useEffect, useState } from "react"
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Link } from "expo-router"
import { useAtom } from "jotai"

import type {
  Notification,
  P2PNotification,
  UserRewardNotification,
} from "~/state/notifications"
import type { RouterOutputs } from "~/utils/api"
import { useAuth } from "~/hooks/auth"
import { notificationsAtom, TransactionType } from "~/state/notifications"
import { api } from "~/utils/api"

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

const mapUserRewardToNotification = (
  reward: RouterOutputs["transaction"]["getUserRewards"][number],
): UserRewardNotification => ({
  id: reward.id,
  points: reward.reward.points,
  transactionDate: reward.createdAt,
  type: TransactionType.P2REWARD,
})

const mapP2PTransactionToNotification = (
  transaction: RouterOutputs["transaction"]["getUserTransactions"][number],
): P2PNotification => ({
  id: transaction.id,
  points: transaction.points,
  transactionDate: transaction.createdAt,
  type: TransactionType.P2P,
  from: transaction.from,
  to: transaction.to,
})

export default function PointsPage() {
  const [notifications, setNotifications] = useAtom(notificationsAtom)
  const [activeTab, setActiveTab] = useState("Rewards") // State for active tab
  const { user } = useAuth()

  const { data: userRewards } = api.transaction.getUserRewards.useQuery()
  const { data: p2pTransactions } =
    api.transaction.getUserTransactions.useQuery()

  useEffect(() => {
    if (userRewards && p2pTransactions) {
      const combinedNotifications = ([] as Notification[])
        .concat(userRewards.map(mapUserRewardToNotification))
        .concat(p2pTransactions.map(mapP2PTransactionToNotification))

      setNotifications(combinedNotifications)
    }
  }, [userRewards, p2pTransactions, setNotifications])

  // Filter notifications based on the active tab
  const filteredNotifications =
    activeTab === "Rewards"
      ? notifications.filter((item) => item.type === TransactionType.P2REWARD)
      : notifications.filter((item) => item.type === TransactionType.P2P)

  if (!user) return null

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="items-center rounded-xl bg-emerald-700 p-4">
        <Text className="text-lg text-white">Pontuação atual</Text>
        <Text className="text-6xl font-bold text-white">
          {user.totalPoints}
        </Text>
      </View>

      <View className="my-4 flex-row justify-around">
        <TouchableOpacity className="rounded-lg bg-gray-200 p-3">
          <Link href="/scan/my-code">Receber</Link>
        </TouchableOpacity>
        <TouchableOpacity className="rounded-lg bg-gray-200 p-3">
          <Link href="/points/send">Enviar</Link>
        </TouchableOpacity>
        <TouchableOpacity className="rounded-lg bg-gray-200 p-3">
          <Link href="/points/reward">Resgatar</Link>
        </TouchableOpacity>
      </View>

      <View className="rounded-t-xl bg-emerald-900 p-4">
        <Text className="text-xl text-white">Histórico</Text>
      </View>

      <View className="flex-row justify-around bg-white p-2">
        <TouchableOpacity
          onPress={() => setActiveTab("Rewards")}
          className={`flex-1 p-2 text-center ${
            activeTab === "Rewards"
              ? "bg-emerald-700 text-white"
              : "bg-gray-200"
          }`}
        >
          <Text className="font-bold">Rewards</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("Transactions")}
          className={`flex-1 p-2 text-center ${
            activeTab === "Transactions"
              ? "bg-emerald-700 text-white"
              : "bg-gray-200"
          }`}
        >
          <Text className="font-bold">Transactions</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-white shadow-sm">
        {filteredNotifications.length === 0 ? (
          <View className="p-4">
            <Text className="text-center text-gray-500">
              You don't have any notifications yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredNotifications}
            keyExtractor={(item) => item.id} // Use unique IDs for keys
            renderItem={({ item }) => (
              <View className="flex-row justify-between border-b border-gray-200 p-4">
                <View>
                  <Text>{item.id}</Text>
                  <Text className="text-base">
                    {item.points} pontos . {item.type}
                  </Text>
                  <Text className="text-gray-500">
                    Data:{" "}
                    {`${item.transactionDate?.split("-")[2]} de ${
                      months[item.transactionDate?.split("-")[1] ?? ""]
                    } de ${item.transactionDate?.split("-")[0]}`}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Text className="text-emerald-700">→</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }} // Space at the bottom
          />
        )}
      </View>
    </SafeAreaView>
  )
}
