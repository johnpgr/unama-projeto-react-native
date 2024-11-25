import React from "react"
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native"
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons" // Import MaterialIcons

import { Controller, useForm } from "react-hook-form"

import type { RouterInputs } from "~/utils/api"
import { useAuth } from "~/hooks/auth"
import { api } from "~/utils/api"

type SendPointsInput = RouterInputs["transaction"]["createP2PTransaction"]

export default function SendPointsScreen() {
  const utils = api.useUtils()
  const router = useRouter()
  const [isAgreed, setIsAgreed] = React.useState(false)
  const { receiverId } = useLocalSearchParams()
  const form = useForm<SendPointsInput>({
    defaultValues: {
      receiverId: typeof receiverId === "string" ? receiverId : "",
      amountPoints: 0,
    },
  })

  const {
    mutateAsync: sendPoints,
    isPending,
    error,
    isSuccess,
  } = api.transaction.createP2PTransaction.useMutation({
    onSuccess: async () => {
      await utils.user.getUserExtract.invalidate()
      router.navigate("/(drawer)/(tabs)/points/success")
    },
  })

  function resetForm() {
    form.reset({
      receiverId: typeof receiverId === "string" ? receiverId : "",
      amountPoints: 0,
    })
    setIsAgreed(false)
  }

  useFocusEffect(
    React.useCallback(() => {
      return () => resetForm()
    }, []),
  )

  async function onSubmit(data: SendPointsInput) {
    if (!isAgreed) {
      return
    }
    const amountPoints = data.amountPoints
    if (Number.isNaN(amountPoints) || amountPoints <= 0) {
      throw new Error("A quantidade de pontos deve ser um número positivo.")
    }
    await sendPoints(data)
  }
  const { user } = useAuth()

  return (
    // Dismiss keyboard on outside press
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white p-4">
        {/* User Profile Section */}
        <View className="mb-6 items-center">
          <View className="w-full items-center rounded-xl bg-green-900 p-4">
            <Image
              source={{ uri: "https://via.placeholder.com/100" }}
              className="h-16 w-16 rounded-full"
            />
            <Text className="mt-2 text-lg font-bold text-white">{user?.fullName}</Text>
            <Text className="text-white">{user?.totalPoints}</Text>

            {/* Amount Points Input with Line Underneath */}
            <Controller
              control={form.control}
              name="amountPoints"
              render={({ field }) => (
                <View className="mb-4">
                  <Text className="mb-2 text-white">Digite o tanto de pontos</Text>
                  <TextInput
                    className="border-b border-gray-300 px-4 py-2 text-white"
                    placeholder="0000"
                    placeholderTextColor="#ffffffaa"
                    keyboardType="numeric"
                    onChangeText={(value) => {
                      const sanitizedValue = value.replace(/[^0-9]/g, "")
                      field.onChange(sanitizedValue ? parseInt(sanitizedValue, 10) : "")
                    }}
                    value={field.value.toString() || ""}
                    onBlur={field.onBlur}
                  />
                </View>
              )}
            />
          </View>
        </View>

        {/* Agreement with React Native Check Icon */}
        <Pressable onPress={() => setIsAgreed(!isAgreed)} className="mb-4 flex-row items-center">
          <MaterialIcons
            name={isAgreed ? "check-box" : "check-box-outline-blank"} // Conditionally render the icon
            size={30}
            color={isAgreed ? "green" : "gray"}
          />
          <Text className="ml-2 text-gray-700">Concordo com o envio de pontos</Text>
        </Pressable>
        <Pressable
          className="mb-4 w-full items-center rounded-xl bg-gray-200 py-4"
          onPress={() => {
            // Implement QR code logic here
          }}
        >
          <Text className="text-gray-700">Enviar por QRCode</Text>
        </Pressable>

        {/* Code Input */}
        <Text className="mb-2 text-center text-gray-700">Ou código</Text>
        <Controller
          control={form.control}
          name="receiverId"
          render={({ field }) => (
            <TextInput
              className="mb-6 rounded-xl border border-gray-300 px-4 py-2 text-center"
              placeholder="00000"
              keyboardType="numeric"
              onChangeText={field.onChange}
              value={field.value}
              onBlur={field.onBlur}
            />
          )}
        />

        <Pressable
          className="relative flex flex-row items-center justify-center rounded-3xl bg-green-900 py-4 disabled:opacity-80"
          onPress={form.handleSubmit(onSubmit)}
          disabled={isPending || !isAgreed}
        >
          {isPending ? (
            <ActivityIndicator className="absolute left-[35%]" size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-xl font-bold text-white">Enviar</Text>
          )}
        </Pressable>

        {/* Success/Error Messages */}
        {isSuccess && <Text className="mt-4 text-green-700">Pontos enviados com sucesso!</Text>}
        {error && <Text className="mt-4 text-red-700">Erro: {error.message}</Text>}
      </View>
    </TouchableWithoutFeedback>
  )
}
