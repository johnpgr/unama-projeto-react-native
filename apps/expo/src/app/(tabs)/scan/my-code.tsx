import React from "react"
import { Platform, Pressable, Text, View } from "react-native"
import { Link, Redirect, useRouter } from "expo-router"
import { EvilIcons } from "@expo/vector-icons"
import QRCode from "react-qr-code"

import { useAuth } from "~/hooks/auth"
import { api } from "~/utils/api"
import { TODO } from "~/utils/todo"

export default function MyCodeScreen() {
  const router = useRouter()
  const onTransaction = api.transaction.onP2PTransaction.useSubscription()
  const { user } = useAuth()
  if (!user) return null

  function onPressShareHandler() {
    TODO("Implement share handler")
  }

  if (onTransaction.data) {
    return (
      <Redirect
        href={`/scan/received-points?points=${onTransaction.data.pointsTransferred}&sender=${onTransaction.data.senderId}`}
      />
    )
  }

  return (
    <View className="mt-4 flex flex-1 flex-col items-center gap-10 px-4">
      <View className="flex w-full flex-row items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <EvilIcons name="chevron-left" size={40} />
        </Pressable>
        <Pressable onPress={onPressShareHandler}>
          {Platform.OS === "ios" ? (
            <EvilIcons name="share-apple" size={32} />
          ) : (
            <EvilIcons name="share-google" size={32} />
          )}
        </Pressable>
      </View>
      <View className="mx-auto flex h-96 w-11/12 items-center justify-center rounded-lg bg-gray-200">
        <View className="rounded-lg bg-white p-8">
          <QRCode size={200} value={user.id} />
        </View>
      </View>
      <Text className="text-center text-lg">
        Meu código é: {"\n"}
        <Text className="font-bold tracking-widest">{user.id}</Text>
      </Text>
      <Text>{JSON.stringify(onTransaction.error, null, 2)}</Text>
      <Link
        href="/scan"
        className="rounded-2xl bg-primary p-4 px-16 transition-colors active:bg-primary/90"
      >
        <Text className="text-center text-white">Escanear</Text>
      </Link>
    </View>
  )
}
