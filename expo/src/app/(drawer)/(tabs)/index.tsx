/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react"
import { Image, Pressable, ScrollView, Text, View } from "react-native"
import { Link } from "expo-router"

import CampaignCardImage from "../../../../assets/card_1.png"
import CampaignCardImage2 from "../../../../assets/card_2.png"

export default function Index() {
  return (
    <View className="flex-1 gap-8 bg-white px-4 pt-4">
      <ScrollView className="flex-col gap-2">
        <Text className="text-lg">Campanhas perto de você</Text>
        <View className="flex flex-row p-4">
          <Link href={"/campaigns/1"} asChild>
            <Pressable>
              <Image
                source={CampaignCardImage}
                className="h-80 w-80"
                resizeMode="contain"
              />
            </Pressable>
          </Link>
          <Image
            source={CampaignCardImage2}
            className="-ml-20 h-80 w-80"
            resizeMode="contain"
          />
        </View>
        <Text className="text-medium text-lg text-primary">Sobre a COP30:</Text>
        <Text className="text-center text-lg">
          A COP 30 é a Conferência das Nações Unidas sobre Mudanças Climáticas,
          que será realizada em Belém do Pará, em novembro de 2025.
        </Text>
        <View className="h-[1px] w-full bg-border"></View>
        <View className="flex flex-row gap-2 p-2">
          <Text className="max-w-64 text-lg">
            A COP, que significa "Conferência das Partes", reúne representantes
            de 198 países, ativistas, defensores do meio ambiente, empresas e a
            sociedade civil para discutir e acelerar ações em prol de um planeta
            mais sustentável
          </Text>
          <View className="h-48 w-40 rounded-2xl bg-zinc-200"></View>
        </View>
      </ScrollView>
    </View>
  )
}
