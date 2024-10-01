/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { LinkProps } from "expo-router"
import React from "react"
import { Image, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Link, Redirect, Slot, usePathname } from "expo-router"
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons"

import { useSession } from "~/utils/auth"

function AppHeader() {
    const { data } = useSession()
    if (!data.user) return null

    return (
        <SafeAreaView>
            <View className="flex flex-row items-center justify-between p-6">
                <Text className="text-xl font-bold">ECOPoints</Text>
                <View className="flex flex-row items-center gap-4">
                    <AntDesign name="search1" size={24} />
                    <Ionicons name="notifications-outline" size={26} />
                </View>
            </View>
        </SafeAreaView>
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
            <Pressable className="flex flex-col w-16 items-center">
                <Entypo
                    name={props.iconName}
                    size={32}
                    color={
                        isActive
                            ? NavigationColor.active
                            : NavigationColor.default
                    }
                />
                <Text
                    style={{
                        color: isActive
                            ? NavigationColor.active
                            : NavigationColor.default,
                    }}
                >
                    {props.label}
                </Text>
            </Pressable>
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
            className="absolute right-[45%] -top-5 translate-x-1/2"
        >
            <View className="flex flex-col">
                <View className="h-16 w-16 flex items-center justify-center rounded-full bg-primary">
                    <Image
                        source={require("../../../assets/qr_code.png")}
                        className="w-10 h-10"
                        resizeMode="contain"
                    />
                </View>
                <Text
                    style={{
                        color: isActive
                            ? NavigationColor.active
                            : NavigationColor.default,
                    }}
                >
                    Escanear
                </Text>
            </View>
        </Link>
    )
}

function AppNavigationBar() {
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

export default function AppLayout() {
    const { data, isLoading } = useSession()
    if (isLoading) return null
    if (!data.session) return <Redirect href={"/onboarding"} />

    return (
        <>
            <AppHeader />
            <Slot />
            <AppNavigationBar />
        </>
    )
}
