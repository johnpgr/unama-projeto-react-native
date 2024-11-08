/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"
import { BackHandler, Platform, Pressable, Text, View } from "react-native"
import { EvilIcons } from "@expo/vector-icons"
import { useAtom } from "jotai"
import QRCode from "react-qr-code"

import { useSession } from "~/hooks/auth"
import { TODO } from "~/utils/todo"
import { CurrentScanView } from "./CurrentScanView"

export function MyCode() {
  const [_, setCurrentView] = useAtom(CurrentScanView)
  const { data } = useSession()

  function onPressShareHandler() {
    TODO("Implement share handler")
  }

  function goBack() {
    setCurrentView("SCAN")
  }

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        goBack()
        return true
      },
    )
    return () => backHandler.remove()
  }, [])

  const user = data.user!

  return (
    <View className="mt-4 flex flex-1 flex-col items-center gap-10 px-4">
      <View className="flex w-full flex-row items-center justify-between">
        <Pressable onPress={goBack}>
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
          <QRCode size={200} value={user.userCode} />
        </View>
      </View>
      <Text className="text-center text-lg">
        Meu código é: {"\n"}
        <Text className="font-bold tracking-widest">{user.userCode}</Text>
      </Text>
      <Pressable
        onPress={goBack}
        className="rounded-2xl bg-primary p-4 px-16 transition-colors active:bg-primary/90"
      >
        <Text className="text-center text-white">Escanear</Text>
      </Pressable>
    </View>
  )
}
