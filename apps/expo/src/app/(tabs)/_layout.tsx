import React from "react"
import { BackHandler, Pressable, View } from "react-native"
import { Redirect, Tabs } from "expo-router"
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { useAtom } from "jotai"

import { useAuth } from "~/hooks/auth"
import { searchAtom } from "~/state/search"

export default function TabLayout() {
  const { session, isPending } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useAtom(searchAtom)

  React.useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (!isSearchOpen) return false

        setIsSearchOpen(false)
        return true
      },
    )
    return () => backHandler.remove()
  }, [isSearchOpen, setIsSearchOpen])

  if (isPending) return null
  if (!session) return <Redirect href={"/onboarding"} />

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#003822",
        tabBarStyle: { paddingTop: 8, paddingBottom: 8, height: 64 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "ECOPoints",
          headerRight: () => (
            <View className="mr-4 flex flex-row items-center gap-4">
              <Pressable onPress={() => setIsSearchOpen((prev) => !prev)}>
                <AntDesign name="search1" size={24} />
              </Pressable>
              <Ionicons name="notifications-outline" size={26} />
            </View>
          ),
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={32} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="points/index"
        options={{
          title: "Pontos",
          tabBarIcon: ({ color }) => (
            <Entypo name="wallet" size={32} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="points/send"
        options={{
          title: "Enviar Pontos",
          href: null,
        }}
      />

      <Tabs.Screen
        name="points/reward"
        options={{
          title: "Recompensas",
          href: null,
        }}
      />

      <Tabs.Screen
        name="scan/index"
        options={{
          title: "Escanear",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="qr-code-scanner" size={32} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan/my-code"
        options={{
          title: "Meu código",
          href: null,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="qr-code" size={32} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => (
            <Entypo name="chat" size={32} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="menu/index"
        options={{
          title: "Menu",
          tabBarIcon: ({ color }) => (
            <Entypo name="menu" size={32} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="campaigns/[slug]/index"
        options={{
          href: null,
          title: "Campanha",
        }}
      />
    </Tabs>
  )
}
