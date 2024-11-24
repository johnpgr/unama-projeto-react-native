/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { DrawerContentComponentProps, DrawerNavigationOptions } from "@react-navigation/drawer"
import type { Href } from "expo-router"
import React from "react"
import { Alert, Image, Pressable, Text, View } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { Redirect, useRouter } from "expo-router"
import { Drawer } from "expo-router/drawer"
import { Ionicons, SimpleLineIcons } from "@expo/vector-icons"
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer"

import type { User } from "@projeto/api"

import { useAuth, useSignOut } from "~/hooks/auth"
import DefaultAvatar from "../../../assets/avatar_default.png"

interface CustomDrawerContentProps extends DrawerContentComponentProps {
  user: User
}

export function CustomDrawerContent(props: CustomDrawerContentProps) {
  const router = useRouter()

  // This function is here due to router.navigate() not working in the drawer
  function navigate(path: Href) {
    router.replace(path)
    setImmediate(() => props.navigation.closeDrawer())
  }

  return (
    <DrawerContentScrollView {...props}>
      <View className="relative flex-col p-4 py-6">
        <LogoutButton />
        <Image
          resizeMode="contain"
          source={props.user.imageUrl ? { uri: props.user.imageUrl } : DefaultAvatar}
          className="h-16 w-16 rounded-full"
          fadeDuration={0}
        />
        <Text className="mt-4 text-xl font-medium">{props.user.fullName}</Text>
        <Text className="text-foreground/50">{props.user.email}</Text>
        <Text className="mt-2 font-medium text-primary">{props.user.totalPoints} pontos</Text>
        <View className="mt-6 h-[1px] w-full bg-gray-300"></View>
      </View>

      <DrawerItem
        label="Meu perfil"
        icon={({ color, size }) => <SimpleLineIcons name="user" size={size} color={color} />}
        onPress={() => navigate("/account")}
      />

      <DrawerItem
        label="Resgatar recompensas"
        icon={({ color, size }) => <SimpleLineIcons name="present" size={size} color={color} />}
        onPress={() => navigate("/points/reward")}
      />

      <DrawerItem
        label={"Configurações e privacidade"}
        icon={({ color, size }) => <SimpleLineIcons name="settings" size={size} color={color} />}
        onPress={() => navigate("/settings")}
      />

      <DrawerItem
        label="Ajuda e suporte"
        icon={({ color, size }) => <SimpleLineIcons name="question" size={size} color={color} />}
        onPress={() => void 0}
      />

      <DrawerItem
        label="Permissões"
        icon={({ color, size }) => <SimpleLineIcons name="info" size={size} color={color} />}
        onPress={() => void 0}
      />

      <DrawerItem
        label="Modo escuro"
        icon={({ color, size }) => <Ionicons name="moon-outline" size={size} color={color} />}
        onPress={() => void 0}
      />
    </DrawerContentScrollView>
  )
}

export function LogoutButton() {
  const { signOut } = useSignOut()

  function handleLogoutClick() {
    Alert.alert(
      "Sair",
      "Você tem certeza que deseja sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          onPress: () => void signOut(),
        },
      ],
      { cancelable: true },
    )
  }

  return (
    <>
      <Pressable className="absolute right-8 top-8" onPress={handleLogoutClick}>
        <Text className="text-destructive">
          <SimpleLineIcons name="logout" size={20} />
        </Text>
      </Pressable>
    </>
  )
}

export default function DrawerLayout() {
  const { user } = useAuth()
  if (!user) return <Redirect href="/" />

  return (
    <GestureHandlerRootView>
      <Drawer
        screenOptions={{ headerShown: false } satisfies DrawerNavigationOptions}
        drawerContent={(props: DrawerContentComponentProps) => (
          <CustomDrawerContent user={user} {...props} />
        )}
      />
    </GestureHandlerRootView>
  )
}
