import { Pressable, Text, TextInput, View } from "react-native"
import { Controller, useForm } from "react-hook-form"

import type { RouterInputs } from "@projeto/api"

import { api } from "~/utils/api"

type addRewardsInput = RouterInputs["transaction"]["createReward"]
export default function MenuScreen() {
  const form = useForm<addRewardsInput>({
    defaultValues: { rewardName: "", points: 0 },
  })
  const { mutateAsync, isSuccess, error } =
    api.transaction.createReward.useMutation()
  async function onSubmit(data: addRewardsInput) {
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
  return (
    <View>
      <Text>Adicionar elementos:</Text>
      <Controller
        control={form.control}
        name="rewardName"
        render={({ field }) => (
          <TextInput
            className="rounded-xl border border-border px-4 py-2"
            placeholder="Digite o nome do prêmio"
            onChangeText={field.onChange}
            value={field.value.toString()}
            onBlur={field.onBlur}
          />
        )}
      ></Controller>
      <Controller
        control={form.control}
        name="points"
        render={({ field }) => (
          <TextInput
            className="rounded-xl border border-border px-4 py-2"
            placeholder="Digite o valor do prêmio"
            keyboardType="numeric"
            onChangeText={(value) => {
              const sanitizedValue = value.replace(/[^0-9]/g, "")
              field.onChange(sanitizedValue ? parseInt(sanitizedValue, 10) : "")
            }}
            value={field.value.toString()}
            onBlur={field.onBlur}
          />
        )}
      ></Controller>
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
