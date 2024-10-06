import React from "react"
import { ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const rewards = [
    {
        id: 1,
        icon: "gift-outline" as const,
        name: "Vale Presente",
        points: 100,
    },
    { id: 2, icon: "pizza-outline" as const, name: "Cupom Pizza", points: 50 },
    {
        id: 3,
        icon: "car-outline" as const,
        name: "Desconto em Serviço",
        points: 200,
    },
]

const RewardsPage = () => {
    return (
        <ScrollView className="flex-1 bg-white p-4">
            <Text className="mb-4 text-center text-xl font-bold">
                Recompensas Disponíveis
            </Text>

            <View className="flex flex-row flex-wrap">
                {rewards.map((reward) => (
                    <View key={reward.id} className="w-1/2 p-2">
                        <View className="items-center rounded-lg bg-gray-100 p-4">
                            <Ionicons
                                name={reward.icon}
                                size={50}
                                color="#4B5563"
                            />
                            <Text className="mt-2 text-lg font-semibold">
                                {reward.name}
                            </Text>
                            <Text className="mb-2 text-sm text-gray-600">
                                Pontos: {reward.points}
                            </Text>
                            <TouchableOpacity className="rounded-md bg-blue-500 px-4 py-2">
                                <Text className="font-bold text-white">
                                    Resgatar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

export default RewardsPage
