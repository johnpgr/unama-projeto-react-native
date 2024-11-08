import { useState } from "react"
import { Pressable, Text, View } from "react-native"
import CurrencyInput from "react-native-currency-input"
import { useForm } from "react-hook-form"

import type { RouterInputs } from "@projeto/api"

import { api } from "~/utils/api"

type AddRewardsInput = RouterInputs["transaction"]["createReward"]
export default function MenuScreen() {
  const form = useForm<AddRewardsInput>({
    defaultValues: { rewardName: "", points: 0 },
  })
  const { mutateAsync, isSuccess, error } =
    api.transaction.createReward.useMutation()
  async function onSubmit(data: AddRewardsInput) {
    const amountPoints = data.points
    const rewardName = data.rewardName
    if (isNaN(amountPoints) || amountPoints <= 0) {
      console.error("A quantidade de pontos deve ser um número positivo.")
      return
    }
    if (rewardName === "") {
      throw new Error("O nome do prêmio não pode ser vazio.")
    }

    await mutateAsync({ points: amountPoints, rewardName: rewardName })
  }
  const [value, setValue] = useState(0)
  return (
    <View>
      <Text>Adicionar elementos:</Text>
      <CurrencyInput
        className="rounded-xl border border-border px-4 py-2"
        value={value}
        onChangeValue={(value) => setValue(value ?? 0)}
        delimiter="."
        separator=","
        precision={0}
        minValue={0}
        onChangeText={(formattedValue) => {
          console.log(formattedValue)
        }}
      />
      <Pressable
        className="relative flex flex-row items-center justify-center rounded-3xl bg-green-900 py-4 disabled:opacity-80"
        onPress={form.handleSubmit(onSubmit)}
      >
        <Text className="text-lg font-semibold text-white">Adicionar</Text>
      </Pressable>
      {isSuccess && <Text>Pontos enviados com sucesso!</Text>}
      {error && <Text>Erro: {error.message}</Text>}
    </View>
  )
}
