import React, { useState } from "react"
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
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

import { api } from "~/utils/api"

interface PopupProps {
  visible: boolean
  onClose: () => void
  message: string
  type: "success" | "error"
}

interface Reward {
  rewardsId: number
  reward: string | null
  points: number
}

const enum POPUP_TYPES {
  SUCCESS = "success",
  ERROR = "error",
}

const ICON_CONFIG = {
  size: 24,
  color: "#4B5563",
} as const

const PopupHeader: React.FC<{
  type: PopupProps["type"]
  onClose: () => void
}> = ({ type, onClose }) => (
  <View className="mb-3 flex-row items-center justify-between">
    <Text className="text-lg font-semibold">
      {type === POPUP_TYPES.SUCCESS ? "Sucesso!" : "Erro"}
    </Text>
    <TouchableOpacity onPress={onClose}>
      <Ionicons
        name="close"
        size={ICON_CONFIG.size}
        color={ICON_CONFIG.color}
      />
    </TouchableOpacity>
  </View>
)

const Popup: React.FC<PopupProps> = ({ visible, onClose, message, type }) => (
  <Modal
    transparent
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
  >
    <Pressable
      className="flex-1 items-center justify-center bg-black/50"
      onPress={onClose}
    >
      <Pressable
        className="w-4/5 rounded-lg bg-white p-4 shadow-lg"
        onPress={(e) => e.stopPropagation()}
      >
        <PopupHeader type={type} onClose={onClose} />
        <Text className="text-gray-600">{message}</Text>
      </Pressable>
    </Pressable>
  </Modal>
)

const RewardCard: React.FC<{
  reward: Reward
  onRedeem: (id: number) => void
}> = ({ reward, onRedeem }) => (
  <View className="w-1/2 p-2">
    <View className="items-center rounded-lg bg-gray-100 p-4">
      <Ionicons name="car-outline" size={50} color={ICON_CONFIG.color} />
      <Text className="mt-2 text-lg font-semibold">{reward.reward}</Text>
      <Text className="mb-2 text-sm text-gray-600">
        Pontos: {reward.points}
      </Text>
      <TouchableOpacity
        className="rounded-md bg-blue-500 px-4 py-2"
        onPress={() => onRedeem(reward.rewardsId)}
      >
        <Text className="font-bold text-white">Resgatar</Text>
      </TouchableOpacity>
    </View>
  </View>
)

const EmptyRewardsList: React.FC = () => (
  <View className="flex items-center justify-center p-4">
    <Text className="text-lg font-semibold">No available rewards</Text>
  </View>
)

const LoadingSpinner: React.FC = () => (
  <ActivityIndicator size="large" color="#0000ff" />
)

export default function RewardsPage() {
  // State
  const [popupState, setPopupState] = useState({
    isVisible: false,
    message: "",
    type: POPUP_TYPES.SUCCESS as PopupProps["type"],
  })
  const [isExchanging, setIsExchanging] = useState(false)

  // Queries & Mutations
  const { data: rewards = [], isLoading: isLoadingRewards } =
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

  const handleRedeemReward = (rewardId: number) => {
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

  const handleClosePopup = () => {
    setPopupState({
      isVisible: false,
      message: "",
      type: POPUP_TYPES.SUCCESS,
    })
  }

  const renderContent = () => {
    switch (true) {
      case isLoadingRewards || isExchanging:
        return <LoadingSpinner />
      case rewards.length === 0:
        return <EmptyRewardsList />
      default:
        return (
          <ScrollView>
            <View className="flex-row flex-wrap">
              {rewards.map((reward) => (
                <RewardCard
                  key={reward.rewardsId}
                  reward={reward}
                  onRedeem={handleRedeemReward}
                />
              ))}
            </View>
          </ScrollView>
        )
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {renderContent()}
      <Popup
        visible={popupState.isVisible}
        onClose={handleClosePopup}
        message={popupState.message}
        type={popupState.type}
      />
    </SafeAreaView>
  )
}
