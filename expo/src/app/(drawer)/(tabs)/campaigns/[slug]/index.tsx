/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Image, ScrollView, Text, View } from "react-native"
import Markdown from "react-native-markdown-display"
import { useLocalSearchParams } from "expo-router"

const campaigns = [
  {
    slug: "1",
    cover: require("../../../../../../assets/card_1.png"),
    content: `
## Você já se deparou com aquela situação em que está segurando um lixo, mas não encontra uma lixeira por perto?
### Isso acontece com mais frequência do que imaginamos, mas o que podemos fazer nessas situações? Aqui vão algumas dicas simples para ajudar o meio ambiente e fazer a diferença:
1. Leve com você: Se não há uma lixeira por perto, leve o lixo até encontrar um local adequado. Jogar no chão nunca é a solução. Pequenas atitudes fazem uma grande diferença!`,
  },
]

export default function CampaignScreen() {
  const { slug } = useLocalSearchParams()
  if (typeof slug !== "string") return null

  const campaign = campaigns.find((c) => c.slug === slug)
  if (!campaign)
    return (
      <View>
        <Text>Not found</Text>
      </View>
    )

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" className="h-full border p-4">
      <Image source={campaign.cover} className="h-96 w-96" resizeMode="contain" />
      <Markdown
        style={{
          heading2: { marginBottom: 24 },
          heading3: { marginBottom: 24 },
        }}
        mergeStyle
      >
        {campaign.content}
      </Markdown>
    </ScrollView>
  )
}
