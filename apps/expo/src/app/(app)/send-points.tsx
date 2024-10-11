import React from "react"
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native"
import { Controller, useForm } from "react-hook-form"

import type { RouterInputs } from "~/utils/api"
import { api } from "~/utils/api"

type SendPointsInput = RouterInputs["transaction"]["sendPointsP2P"]

export default function SendPointsScreen() {
  const [isAgreed, setIsAgreed] = React.useState(false)
  const form = useForm<SendPointsInput>({
    defaultValues: { receiverId: "0", amountPoints: 0 },
  })
  const {
    mutateAsync: sendPoints,
    isPending,
    error,
  } = api.transaction.sendPointsP2P.useMutation()

  async function onSubmit(data: SendPointsInput) {
    if (!isAgreed) {
      return
    }
    const amountPoints = data.amountPoints
    if (isNaN(amountPoints) || amountPoints <= 0) {
      console.error("A quantidade de pontos deve ser um número positivo.")
      return
    }
    await sendPoints(data)
  }
  return (
    <View>
      <Controller
        control={form.control}
        name="receiverId"
        render={({ field }) => (
          <TextInput
            className="rounded-xl border border-border px-4 py-2"
            placeholder="Digite o ID do receptor"
            onChangeText={field.onChange}
            value={field.value}
            onBlur={field.onBlur}
          />
        )}
      />
      {/* Input para a quantidade de pontos */}
      <Controller
        control={form.control}
        name="amountPoints"
        render={({ field }) => (
          <TextInput
            className="rounded-xl border border-border px-4 py-2"
            placeholder="Insira a quantidade de pontos"
            keyboardType="numeric"
            onChangeText={(value) => {
              const sanitizedValue = value.replace(/[^0-9]/g, "")
              field.onChange(sanitizedValue ? parseInt(sanitizedValue, 10) : "")
            }}
            value={field.value.toString() || ""}
            onBlur={field.onBlur}
          />
        )}
      />
      {error && <Text>Erro: {error.message}</Text>}

      <Pressable onPress={() => setIsAgreed(!isAgreed)}>
        <Text>{isAgreed ? "☑" : "☐"} Concordo com o envio de pontos</Text>
      </Pressable>

      <Pressable
        className="relative flex flex-row items-center justify-center rounded-3xl bg-green-900 py-4 disabled:opacity-80"
        onPress={form.handleSubmit(onSubmit)}
        disabled={isPending || !isAgreed}
      >
        {isPending ? (
          <ActivityIndicator
            className="absolute left-[35%]"
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <Text className="text-xl font-bold text-white">Enviar</Text>
        )}
      </Pressable>
    </View>
  )
}
