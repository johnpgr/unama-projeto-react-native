import type { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs"
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-namespace */
import type { DrawerNavigationProp } from "@react-navigation/drawer"
import type { ParamListBase } from "@react-navigation/native"
import React from "react"
import { Image, Platform, Pressable, StyleSheet, Text } from "react-native"
import { Redirect, Tabs, useRouter } from "expo-router"
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { PlatformPressable } from "@react-navigation/elements"
import { DrawerActions, useNavigation } from "@react-navigation/native"

import { useAuth } from "~/hooks/auth"
import { api } from "~/utils/api"
import DefaultAvatar from "../../../../assets/avatar_default.png"

export function DrawerToggleButton({
  tintColor,
  accessibilityLabel = "Mostrar menu de navegação",
  ...rest
}: DrawerToggleButton.Props) {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>()
  const { user } = useAuth()

  return (
    <PlatformPressable
      {...rest}
      accessibilityLabel={accessibilityLabel}
      android_ripple={{ borderless: true }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={styles.touchable}
      hitSlop={Platform.select({
        ios: undefined,
        default: { top: 16, right: 16, bottom: 16, left: 16 },
      })}
    >
      <Image
        style={[styles.icon, tintColor ? { tintColor } : null]}
        resizeMode="contain"
        source={user?.imageUrl ? { uri: user.imageUrl } : DefaultAvatar}
        fadeDuration={0}
      />
    </PlatformPressable>
  )
}

export namespace DrawerToggleButton {
  export interface Props {
    accessibilityLabel?: string
    pressColor?: string
    pressOpacity?: number
    tintColor?: string
  }
}

const styles = StyleSheet.create({
  icon: {
    height: 32,
    width: 32,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  touchable: {
    // Roundness for iPad hover effect
    borderRadius: 10,
  },
})

export default function TabLayout() {
  const { session } = useAuth()
  const router = useRouter()
  const utils = api.useUtils()

  api.transaction.onTransaction.useSubscription(undefined, {
    onData(data) {
      if (data.type === "p2p") {
        router.push(
          `/points/received-points?transactionType=${data.type}&transactionId=${data.id}&points=${data.points}&sender=${data.senderId}`,
        )
      } else {
        router.push(
          `/points/received-points?transactionType=${data.type}&transactionId=${data.id}&points=${data.points}`,
        )
      }
      void utils.user.getUserExtract.invalidate()
    },
    enabled: !!session,
  })

  if (!session) return <Redirect href="/" />

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
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="points/send"
        options={{
          title: "Enviar Pontos",
          href: null,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="points/reward"
        options={{
          title: "Recompensas",
          href: null,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="points/received-points"
        options={{
          title: "Pontos Recebidos",
          href: null,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
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
        name="scan/my-code"
        options={{
          title: "Meu código",
          href: null,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="chat/index"
        options={{
          title: "Chat",
          headerStyle: {
            flexDirection: "row",
            alignItems: "center",
          },
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={() => router.reload()} className="p-4">
              <FontAwesome name="trash-o" size={24} color="red" />
            </Pressable>
          ),
          tabBarIcon: ({ color }) => <Entypo name="chat" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="notifications/index"
        options={{
          title: "Notificações",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
          tabBarIcon: ({ color }) => <Ionicons name="notifications" size={30} color={color} />,
        }}
      />

      <Tabs.Screen
        name="account/index"
        options={{
          title: "Minha conta",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
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
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
          title: "Campanha",
        }}
      />

      <Tabs.Screen
        name="transactions/[id]"
        options={{
          href: null,
          title: "Detalhes da Transação",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="points/success"
        options={{
          href: null,
          title: "Pontos enviados",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
        }}
      />

      <Tabs.Screen
        name="points/trade"
        options={{
          href: null,
          title: "Criar oferta",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="p-4">
              <AntDesign name="arrowleft" size={24} />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  )
}
