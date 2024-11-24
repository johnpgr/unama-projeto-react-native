/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"
import { Text, View } from "react-native"
import { Link } from "expo-router"
import QRCode from "react-qr-code"

import { useAuth } from "~/hooks/auth"

export default function MyCodeScreen() {
  const { user } = useAuth()

  return (
    <View className="flex flex-1 flex-col items-center gap-10 bg-background px-4 pt-16">
      <View className="mx-auto flex h-96 w-11/12 items-center justify-center rounded-lg bg-gray-200">
        <View className="rounded-lg bg-white p-8">
          <QRCode size={200} value={user!.id} />
        </View>
      </View>
      <Text className="text-center text-lg">
        Meu código é: {"\n"}
        <Text className="font-bold tracking-widest">{user!.id}</Text>
      </Text>
      <Link
        href="/scan"
        className="rounded-2xl bg-primary p-4 px-16 transition-colors active:bg-primary/90"
      >
        <Text className="text-center text-white">Escanear</Text>
      </Link>
    </View>
  )
}
