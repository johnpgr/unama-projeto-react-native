import React from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import CurrencyInput from "react-native-currency-input"
import { Ionicons } from "@expo/vector-icons"
import { Controller, useForm } from "react-hook-form"

import type { Reward } from "@projeto/api"

import { useAuth } from "~/hooks/auth"
import { api } from "~/utils/api"

interface AddRewardsInput {
  rewardName: string
  points: number
}

interface PopupProps {
  visible: boolean
  onClose: () => void
  message: string
  type: "success" | "error"
}

const enum POPUP_TYPES {
  SUCCESS = "success",
  ERROR = "error",
}

const ICON_CONFIG = {
  size: 24,
  color: "#4B5563",
} as const

function AddRewards() {
  const { control, handleSubmit, formState } = useForm<AddRewardsInput>({
    defaultValues: { rewardName: "", points: 0 },
  })
  const { errors } = formState
  const { mutateAsync: createReward, isSuccess, error } = api.reward.createReward.useMutation()

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

    await createReward({ points: amountPoints, rewardName })
  }

  return (
    <View className="p-4">
      <Text className="text-lg font-bold">Adicionar Recompensa:</Text>

      {/* Reward Name Input */}
      <Text className="mt-4 text-sm font-medium">Nome do Prêmio</Text>
      <Controller
        name="rewardName"
        control={control}
        rules={{ required: "O nome do prêmio é obrigatório." }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className={`rounded-xl border px-4 py-2 ${
              errors.rewardName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Digite o nome do prêmio"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
          />
        )}
      />
      {errors.rewardName && (
        <Text className="text-sm text-red-500">{errors.rewardName.message}</Text>
      )}

      {/* Points Input */}
      <Text className="mt-4 text-sm font-medium">Quantidade de Pontos</Text>
      <Controller
        name="points"
        control={control}
        rules={{
          required: "A quantidade de pontos é obrigatória.",
          validate: (value) => value > 0 || "A quantidade de pontos deve ser maior que 0.",
        }}
        render={({ field: { onChange, value } }) => (
          <CurrencyInput
            className={`rounded-xl border px-4 py-2 ${
              errors.points ? "border-red-500" : "border-gray-300"
            }`}
            value={value}
            onChangeValue={(val) => onChange(val ?? 0)}
            delimiter="."
            separator=","
            precision={0}
            minValue={0}
          />
        )}
      />
      {errors.points && <Text className="text-sm text-red-500">{errors.points.message}</Text>}

      {/* Submit Button */}
      <Pressable
        className="mt-6 flex items-center justify-center rounded-3xl bg-green-900 py-4 disabled:opacity-80"
        onPress={handleSubmit(onSubmit)}
      >
        <Text className="text-lg font-semibold text-white">Adicionar</Text>
      </Pressable>

      {/* Success or Error Message */}
      {isSuccess && <Text className="mt-4 text-green-600">Pontos enviados com sucesso!</Text>}
      {error && <Text className="mt-4 text-red-600">Erro: {error.message}</Text>}
    </View>
  )
}

function PopupHeader(props: { type: PopupProps["type"]; onClose: PopupProps["onClose"] }) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-lg font-semibold">
        {props.type === POPUP_TYPES.SUCCESS ? "Sucesso!" : "Erro"}
      </Text>
      <TouchableOpacity onPress={props.onClose}>
        <Ionicons name="close" size={ICON_CONFIG.size} color={ICON_CONFIG.color} />
      </TouchableOpacity>
    </View>
  )
}

function Popup(props: PopupProps) {
  return (
    <Modal transparent visible={props.visible} animationType="fade" onRequestClose={props.onClose}>
      <Pressable className="flex-1 items-center justify-center bg-black/50" onPress={props.onClose}>
        <Pressable
          className="w-4/5 rounded-lg bg-white p-4 shadow-lg"
          onPress={(e) => e.stopPropagation()}
        >
          <PopupHeader type={props.type} onClose={props.onClose} />
          <Text className="text-gray-600">{props.message}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

function RewardCard(props: { reward: Reward; onRedeem: (id: string) => void }) {
  return (
    <View className="w-1/2 p-2">
      <View className="items-center rounded-lg bg-gray-100 p-4">
        <Ionicons name="car-outline" size={50} color={ICON_CONFIG.color} />
        <Text className="mt-2 text-lg font-semibold">{props.reward.reward}</Text>
        <Text className="mb-2 text-sm text-gray-600">Pontos: {props.reward.points}</Text>
        <TouchableOpacity
          className="rounded-md bg-blue-500 px-4 py-2"
          onPress={() => props.onRedeem(props.reward.id)}
        >
          <Text className="font-bold text-white">Resgatar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function EmptyRewardsList() {
  return (
    <View className="flex items-center justify-center p-4">
      <Text className="text-lg font-semibold">No available rewards</Text>
    </View>
  )
}

function LoadingSpinner() {
  return <ActivityIndicator size="large" color="#0000ff" />
}

export default function RewardsScreen() {
  const [popupState, setPopupState] = React.useState({
    isVisible: false,
    message: "",
    type: POPUP_TYPES.SUCCESS as PopupProps["type"],
  })
  const [isExchanging, setIsExchanging] = React.useState(false)

  const { data: rewards, isLoading: isLoadingRewards } = api.reward.getAvailableRewards.useQuery()

  const { mutateAsync: exchangePoints } = api.reward.requestReward.useMutation({
    onMutate: () => {
      setIsExchanging(true)
      setPopupState({
        isVisible: false,
        message: "",
        type: POPUP_TYPES.SUCCESS,
      })
    },
    onSuccess: (data) => {
      setIsExchanging(false)
      setPopupState({
        isVisible: true,
        message: `Sucesso! Você resgatou ${data.rewardName}! Pontos restantes: ${data.remainingPoints}`,
        type: POPUP_TYPES.SUCCESS,
      })
    },
    onError: (error) => {
      setIsExchanging(false)
      setPopupState({
        isVisible: true,
        message: error.message,
        type: POPUP_TYPES.ERROR,
      })
    },
  })

  function handleRedeemReward(rewardId: string) {
    Alert.alert("Confirmar Resgate", "Deseja resgatar esta recompensa?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Confirmar",
        onPress: () => void exchangePoints({ rewardId }),
      },
    ])
  }

  function handleClosePopup() {
    setPopupState({
      isVisible: false,
      message: "",
      type: POPUP_TYPES.SUCCESS,
    })
  }

  const { user } = useAuth()

  return (
    <View className="mt-4 flex-1 bg-gray-100">
      {user?.userType === "normal" ? <AddRewards /> : null}

      <RewardList
        rewards={rewards ?? []}
        handleRedeemReward={handleRedeemReward}
        isLoadingRewards={isLoadingRewards}
        isExchanging={isExchanging}
      />
      <Popup
        visible={popupState.isVisible}
        onClose={handleClosePopup}
        message={popupState.message}
        type={popupState.type}
      />
    </View>
  )
}

function RewardList(props: {
  rewards: Reward[]
  handleRedeemReward: (id: string) => Promise<void>
  isLoadingRewards: boolean
  isExchanging: boolean
}) {
  switch (true) {
    case props.isLoadingRewards || props.isExchanging:
      return <LoadingSpinner />
    case props.rewards.length === 0:
      return <EmptyRewardsList />
    default:
      return (
        <ScrollView>
          <View className="flex-row flex-wrap">
            {props.rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                onRedeem={() => props.handleRedeemReward(reward.id)}
              />
            ))}
          </View>
        </ScrollView>
      )
  }
}
