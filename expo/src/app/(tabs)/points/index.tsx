import React from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import { Link } from "expo-router"
import { AntDesign } from "@expo/vector-icons"
import { useAtom } from "jotai"

import type {
  Notification,
  P2PNotification,
  UserRewardNotification,
} from "~/state/notifications"
import type { RouterOutputs } from "~/utils/api"
import { useAuth } from "~/hooks/auth"
import { TransactionType } from "~/state/notifications"
import { api } from "~/utils/api"
import { formatDatePTBR } from "~/utils/date"

const parseUserReward = (
  reward: RouterOutputs["transaction"]["getUserRewards"][number],
): UserRewardNotification => ({
  id: reward.id,
  points: reward.reward.points,
  transactionDate: reward.createdAt,
  type: TransactionType.P2REWARD,
})

const parseP2PRTransaction = (
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
  const { user } = useAuth()

  const { data: userExtract } = api.transaction.getUserExtract.useQuery()
  const keys = Object.keys(userExtract ?? {})

  if (!user) return null

  return (
    <View className="flex-1 bg-white">
      <View className="items-center bg-emerald-700 p-4">
        <Text className="text-lg text-white">Pontuação atual</Text>
        <Text className="text-6xl font-bold text-white">
          {user.totalPoints}
        </Text>
      </View>

      <View className="my-4 flex-row justify-around">
        <Link asChild href="/scan/my-code">
          <TouchableOpacity className="flex min-w-24 flex-col items-center justify-center rounded-lg bg-gray-200 p-2">
            <AntDesign name="download" size={16} />
            <Text>Receber</Text>
          </TouchableOpacity>
        </Link>
        <Link asChild href="/points/send">
          <TouchableOpacity className="flex min-w-24 flex-col items-center justify-center rounded-lg bg-gray-200 p-2">
            <AntDesign name="upload" size={16} />
            <Text>Enviar</Text>
          </TouchableOpacity>
        </Link>
        <Link asChild href="/points/reward">
          <TouchableOpacity className="flex min-w-24 flex-col items-center justify-center rounded-lg bg-gray-200 p-2">
            <AntDesign name="gift" size={16} />
            <Text>Resgatar</Text>
          </TouchableOpacity>
        </Link>
      </View>
      <View className="flex flex-col gap-4">
        <Text className="px-4 text-lg font-medium">Histórico</Text>
        {userExtract ? (
          <FlatList
            data={keys}
            keyExtractor={(date) => date}
            renderItem={({ item }) => {
              const value = userExtract[item]
              if (!value) return null
              return (
                <View>
                  <Text className="px-2 py-1 text-lg font-medium text-gray-700">
                    {item}
                  </Text>
                  <FlatList
                    data={value}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <NotificationItemView notification={item} />
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
                </View>
              )
            }}
          />
        ) : (
          <View className="p-4">
            <Text className="text-center text-gray-100">
              Nehuma notificação encontrada
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

export function NotificationItemView({
  notification,
}: {
  notification: NonNullable<
    RouterOutputs["transaction"]["getUserExtract"][string]
  >[number]
}) {
  switch (notification.type) {
    case "p2pFrom":
    case "p2pTo":
      return (
        <View className="flex-row justify-between border-b border-gray-200 p-4">
          <View>
            <Text>{notification.points} pontos</Text>
            <Text className="text-base">{notification.type}</Text>
            <Text className="text-gray-500">
              Data: {formatDatePTBR(notification.createdAt)}
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="text-emerald-700">→</Text>
          </TouchableOpacity>
        </View>
      )
    case "reward":
      return (
        <View className="flex-row justify-between border-b border-gray-200 p-4">
          <View>
            <Text>Recompensa: {notification.rewardId}</Text>
            <Text className="text-base">{notification.type}</Text>
            <Text className="text-gray-500">
              Data: {formatDatePTBR(notification.createdAt)}
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="text-emerald-700">→</Text>
          </TouchableOpacity>
        </View>
      )
    case "recycling":
      return (
        <View className="flex-row justify-between border-b border-gray-200 p-4">
          <View>
            <Text>Reciclagem: {notification.weight}kg</Text>
            <Text className="text-base">{notification.type}</Text>
            <Text className="text-gray-500">
              Data: {formatDatePTBR(notification.createdAt)}
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="text-emerald-700">→</Text>
          </TouchableOpacity>
        </View>
      )
  }
}
