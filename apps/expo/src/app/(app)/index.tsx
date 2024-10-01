/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"
import { Image, Pressable, Text, View } from "react-native"
import { Link } from "expo-router"
import { MaterialIcons } from "@expo/vector-icons"

import { useSession, useSignOut } from "~/utils/auth"

export default function Index() {
    const { data } = useSession()
    const signOut = useSignOut()
    const user = data.user! // user aqui não pode ser nulo, devido ao layout
    const avatarUrl = user.imageUrl

    return (
        <View className="flex flex-col gap-8 px-4">
            <View className="flex flex-row items-center gap-8">
                <Image
                    source={
                        avatarUrl
                            ? { uri: avatarUrl }
                            : require("../../../assets/avatar_default.png")
                    }
                    className="h-12 w-12 rounded-full"
                    resizeMode="contain"
                />
                <Text className="text-xl font-bold">
                    Bem vindo, {user.fullName}
                </Text>
                <Pressable
                    onPress={() => signOut()}
                    className="flex flex-row items-center gap-2"
                >
                    <Text className="font-bold">Sair</Text>
                    <MaterialIcons name="logout" size={20} />
                </Pressable>
            </View>
            <View className="flex flex-col gap-4">
                <Text className="text-lg">Campanhas perto de você</Text>
                <View className="flex flex-row p-4">
                    <Link href={"/campaigns/1"} asChild>
                        <Pressable>
                            <Image
                                source={require("../../../assets/card_1.png")}
                                className="h-80 w-80"
                                resizeMode="contain"
                            />
                        </Pressable>
                    </Link>
                    <Image
                        source={require("../../../assets/card_2.png")}
                        className="-ml-20 h-80 w-80"
                        resizeMode="contain"
                    />
                </View>
                <Text className="text-medium text-lg text-primary">
                    Sobre a COP30:
                </Text>
                <Text className="text-center text-lg">
                    A COP 30 é a Conferência das Nações Unidas sobre Mudanças
                    Climáticas, que será realizada em Belém do Pará, em novembro
                    de 2025.
                </Text>
                <View className="h-[1px] w-full bg-border"></View>
                <View className="flex flex-row gap-2 p-2">
                    <Text className="max-w-64 text-lg">
                        A COP, que significa "Conferência das Partes", reúne
                        representantes de 198 países, ativistas, defensores do
                        meio ambiente, empresas e a sociedade civil para
                        discutir e acelerar ações em prol de um planeta mais
                        sustentável
                    </Text>
                    <View className="h-48 w-40 rounded-2xl bg-zinc-200"></View>
                </View>
            </View>
        </View>
    )
}
