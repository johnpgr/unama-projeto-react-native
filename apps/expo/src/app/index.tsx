/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react"
import { Image, Text, View } from "react-native"

import { Onboarding } from "~/components/onboarding"
import { useSession } from "~/utils/auth"

export default function Index() {
    const { data: session } = useSession()
    if (!session) return <Onboarding />

    return (
        <View className="flex flex-col gap-8 px-4">
            <View className="flex flex-row items-center gap-8">
                <Image
                    source={require("../../assets/avatar_default.png")}
                    className="h-12 w-12"
                    resizeMode="contain"
                />
                <Text className="text-xl font-bold">
                    Bem vindo, {session.user.fullName}
                </Text>
            </View>
            <View className="flex flex-col gap-4">
                <Text className="text-lg">Campanhas perto de você</Text>
                <View className="p-4">
                    <Image source={require("../../assets/Frame 3.png")}/>
                </View>
                <Text className="text-lg text-primary text-medium">Sobre a COP30:</Text>
                <Text className="text-lg text-center">A COP 30 é a Conferência das Nações Unidas sobre Mudanças Climáticas, que será realizada em Belém do Pará, em novembro de 2025.</Text>
            </View>
        </View>
    )
}
