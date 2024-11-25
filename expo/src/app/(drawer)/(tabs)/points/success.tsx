import React from "react"
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

export default function PoinstsSuccessScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <ScrollView
        contentContainerStyle={{ alignItems: "center", justifyContent: "center", padding: 16 }}
        className="flex-1 bg-white"
      >
        <View className="mb-6 rounded-full bg-green-700 p-6">
          <MaterialIcons name="check" size={50} color="green" />
        </View>

        <Text className="mb-2 text-center text-lg font-semibold text-gray-800">
          Pontos enviados com sucesso!
        </Text>
        <Text className="mb-8 text-center text-base text-gray-600">
          Obrigado por contribuir para um futuro mais sustentável. Continue assim, cada ação conta.
        </Text>

        <TouchableOpacity
          className="rounded-lg bg-gray-200 px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-center font-semibold text-gray-700">Voltar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
