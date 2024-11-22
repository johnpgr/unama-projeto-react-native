import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs"
import React from "react"
import { Pressable, Text } from "react-native"
import { Redirect, Tabs, useRouter } from "expo-router"
import { AntDesign, Entypo, Ionicons, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons"

import { useAuth } from "~/hooks/auth"
import { api } from "~/utils/api"
import { DrawerToggleButton } from "../../_components/DrawerToggleButton"

export default function TabLayout() {
  const { session, isPending } = useAuth()
  const router = useRouter()

  api.transaction.onP2PTransaction.useSubscription(undefined, {
    onData(data) {
      router.push(`/scan/received-points?points=${data.pointsTransferred}&sender=${data.senderId}`)
    },
    enabled: !!session,
  })

  if (isPending) return null
  if (!session) return <Redirect href={"/onboarding"} />

  return (
    <Tabs
      screenOptions={
        {
          tabBarActiveTintColor: "#003822",
          tabBarStyle: { paddingTop: 8, paddingBottom: 8, height: 64 },
          headerLeft: () => <DrawerToggleButton />,
        } satisfies BottomTabNavigationOptions
      }
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          headerTitle: () => <Text className="text-2xl font-medium">ECOPoints</Text>,
          tabBarIcon: ({ color }) => <Entypo name="home" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="points/index"
        options={{
          title: "Pontos",
          tabBarIcon: ({ color }) => <Entypo name="wallet" size={30} color={color} />,
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
            <MaterialIcons name="qr-code-scanner" size={30} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="scan/received-points"
        options={{
          title: "Pontos Recebidos",
          href: null,
        }}
      />

      <Tabs.Screen
        name="scan/my-code"
        options={{
          title: "Meu código",
          href: null,
        }}
      />

      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <Entypo name="chat" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="notifications/index"
        options={{
          title: "Notificações",
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="my-account/index"
        options={{
          title: "Minha conta",
          href: null,
        }}
      />

      <Tabs.Screen
        name="settings/index"
        options={{
          href: null,
          title: "Configurações",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
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
