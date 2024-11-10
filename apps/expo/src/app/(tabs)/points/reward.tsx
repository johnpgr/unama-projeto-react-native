import React from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

import type { schema } from "@projeto/api"

import { api } from "~/utils/api"

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

function PopupHeader(props: {
  type: PopupProps["type"]
  onClose: PopupProps["onClose"]
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="text-lg font-semibold">
        {props.type === POPUP_TYPES.SUCCESS ? "Sucesso!" : "Erro"}
      </Text>
      <TouchableOpacity onPress={props.onClose}>
        <Ionicons
          name="close"
          size={ICON_CONFIG.size}
          color={ICON_CONFIG.color}
        />
      </TouchableOpacity>
    </View>
  )
}

function Popup(props: PopupProps) {
  return (
    <Modal
      transparent
      visible={props.visible}
      animationType="fade"
      onRequestClose={props.onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50"
        onPress={props.onClose}
      >
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

function RewardCard(props: {
  reward: schema.Reward
  onRedeem: (id: string) => void
}) {
  return (
    <View className="w-1/2 p-2">
      <View className="items-center rounded-lg bg-gray-100 p-4">
        <Ionicons name="car-outline" size={50} color={ICON_CONFIG.color} />
        <Text className="mt-2 text-lg font-semibold">
          {props.reward.reward}
        </Text>
        <Text className="mb-2 text-sm text-gray-600">
          Pontos: {props.reward.points}
        </Text>
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

  const { data: rewards, isLoading: isLoadingRewards } =
    api.transaction.getAvailableRewards.useQuery()

  const { mutate: exchangePoints } =
    api.transaction.exchangePointsForReward.useMutation({
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
        onPress: () => exchangePoints({ rewardId }),
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

  function RewardList() {
    switch (true) {
      case isLoadingRewards || isExchanging || !rewards:
        return <LoadingSpinner />
      case rewards?.length === 0:
        return <EmptyRewardsList />
      default:
        return (
          <ScrollView>
            <View className="flex-row flex-wrap">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  onRedeem={() => handleRedeemReward(reward.id)}
                />
              ))}
            </View>
          </ScrollView>
        )
    }
  }

  return (
    <View className="mt-4 flex-1 bg-gray-100">
      <RewardList />
      <Popup
        visible={popupState.isVisible}
        onClose={handleClosePopup}
        message={popupState.message}
        type={popupState.type}
      />
    </View>
  )
}
