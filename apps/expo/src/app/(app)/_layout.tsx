/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { LinkProps } from "expo-router"
import React from "react"
import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, Redirect, Slot, usePathname } from "expo-router"
import { AntDesign, Entypo, Feather, Ionicons } from "@expo/vector-icons"
import { useAtom } from "jotai"

import { searchAtom } from "~/state/search"
import { useSession } from "~/utils/auth"

const ScreenTitles = {
  "/": "ECOPoints",
  "/points": "Pontos",
  "/chat": "Chat",
  "/my-code": "QR Code",
  "/profile": "Perfil",
  "/menu": "Menu",
  "/config": "Configuração",
  "/notifications": "Notificações",
} as Record<string, string>

function AppHeader() {
  const path = usePathname()
  const { data } = useSession()
  const [, setIsSearchOpen] = useAtom(searchAtom)

  if (!data.user) return null
  if (path === "/scan") return null

  return (
    <View className="flex flex-row items-center justify-between p-6">
      <Text className="text-2xl font-bold">{ScreenTitles[path]}</Text>
      <View className="flex flex-row items-center gap-4">
        <TouchableOpacity onPress={() => setIsSearchOpen((prev) => !prev)}>
          <AntDesign name="search1" size={24} />
        </TouchableOpacity>
        <Ionicons name="notifications-outline" size={26} />
      </View>
    </View>
  )
}

const NavigationColor = {
  active: "#003822",
  default: "gray",
} as const

function NavigationItem(props: {
  label: string
  path: LinkProps<string>["href"]
  iconName: keyof typeof Entypo.glyphMap
}) {
  const currentPath = usePathname()
  const isActive = currentPath === props.path

  return (
    <Link asChild href={props.path} disabled={isActive}>
      <TouchableOpacity className="flex w-16 flex-col items-center">
        <Entypo
          name={props.iconName}
          size={32}
          color={isActive ? NavigationColor.active : NavigationColor.default}
        />
        <Text
          style={{
            color: isActive ? NavigationColor.active : NavigationColor.default,
          }}
        >
          {props.label}
        </Text>
      </TouchableOpacity>
    </Link>
  )
}

function ScanButton() {
  const path = "/scan"
  const currentPath = usePathname()
  const isActive = currentPath === path

  return (
    <Link
      href={path}
      disabled={isActive}
      className="absolute -top-5 right-[45%] translate-x-1/2"
    >
      <View className="flex flex-col">
        <View className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
          <Image
            source={require("../../../assets/qr_code.png")}
            className="h-10 w-10"
            resizeMode="contain"
          />
        </View>
        <Text
          style={{
            color: isActive ? NavigationColor.active : NavigationColor.default,
          }}
        >
          Escanear
        </Text>
      </View>
    </Link>
  )
}

function AppNavigationBar() {
  const path = usePathname()
  if (["/search", "/scan"].includes(path)) return null

  return (
    <View className="relative mt-auto flex flex-row justify-around rounded-t-[2rem] border-x border-t border-primary bg-zinc-200 p-4">
      <NavigationItem label="Início" path="/" iconName="home" />
      <NavigationItem label="Pontos" path="/points" iconName="wallet" />
      <View className="w-16"></View>
      <ScanButton />
      <NavigationItem label="Chat" path="/chat" iconName="chat" />
      <NavigationItem label="Menu" path="/menu" iconName="menu" />
    </View>
  )
}

//TODO: Implement search functionality
function AppSearch() {
  const [isSearchOpen, setIsSearchOpen] = useAtom(searchAtom)
  const [search, setSearch] = React.useState("")

  if (!isSearchOpen) return null

  return (
    <KeyboardAvoidingView className="absolute top-7 z-10 w-screen">
      <Animated.View
        className="flex w-full flex-row items-center gap-4 bg-white p-6"
        entering={FadeInUp.duration(100)}
        exiting={FadeOutUp.duration(100)}
      >
        <TouchableOpacity
          className="p-1"
          onPress={() => setIsSearchOpen(false)}
        >
          <Feather name="arrow-left" size={24} />
        </TouchableOpacity>
        <View className="flex flex-1 flex-row items-center gap-2 rounded bg-zinc-200 px-2 py-1">
          <Feather name="search" size={16} />
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder="Buscar"
            className="flex-1"
          />
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

export default function AppLayout() {
  const { data, isLoading } = useSession()
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

  if (isLoading) return null
  if (!data.session) return <Redirect href={"/onboarding"} />

  return (
    <SafeAreaView>
      <AppHeader />
      <AppSearch />
      <Slot />
      <AppNavigationBar />
    </SafeAreaView>
  )
}
