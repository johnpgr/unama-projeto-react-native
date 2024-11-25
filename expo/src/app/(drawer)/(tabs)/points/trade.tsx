import React, { useState } from "react"
import {
  Alert,
  FlatList,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { Entypo, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import { Controller, useForm } from "react-hook-form"

import { api } from "~/utils/api"

interface FormData {
  quantity: string
  itemType: "plastic" | "glass" | "metal" | "paper" | "electronic"
}

enum ItemType {
  PLASTIC_BOTTLE = "plastic",
  GLASS = "glass",
  ALUMINUM = "metal",
  PAPER = "paper",
  ELECTRONIC = "electronic",
}

export function TradeOfferScreen() {
  const [shareLocation, setShareLocation] = useState(false)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()
  const createTradeOffer = api.transaction.createTradeOffer.useMutation()

  const onSubmit = async (data: FormData) => {
    try {
      await createTradeOffer.mutateAsync({
        quantity: Number(data.quantity),
        itemType: data.itemType,
        location: shareLocation
          ? {
              latitude: "0",
              longitude: "0",
            }
          : undefined,
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="mb-6 text-2xl font-bold">Create Trade Offer</Text>

      <View className="space-y-4">
        <View>
          <Text className="mb-1 text-sm font-medium">Weight/Quantity</Text>
          <Controller
            control={control}
            name="quantity"
            rules={{ required: true, min: 1 }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="rounded-md border border-gray-300 p-2"
                keyboardType="numeric"
                onChangeText={onChange}
                value={value}
                placeholder="Enter quantity"
              />
            )}
          />
          {errors.quantity && (
            <Text className="mt-1 text-sm text-red-500">Please enter a valid quantity</Text>
          )}
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium">Item Types</Text>
          <Controller
            control={control}
            name="itemType"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View className="rounded-md border border-gray-300">
                <Picker selectedValue={value} onValueChange={onChange}>
                  <Picker.Item label="Plastic Bottle" value={ItemType.PLASTIC_BOTTLE} />
                  <Picker.Item label="Cardboard" value={ItemType.PAPER} />
                  <Picker.Item label="Glass" value={ItemType.GLASS} />
                  <Picker.Item label="Aluminum" value={ItemType.ALUMINUM} />
                </Picker>
              </View>
            )}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium">Share my location</Text>
          <Switch value={shareLocation} onValueChange={setShareLocation} />
        </View>

        <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={createTradeOffer.isPending} />
      </View>
    </ScrollView>
  )
}

interface TradeOfferListProps {
  ListHeaderComponent?: React.ComponentType<any>
}

export function TradeOfferList({ ListHeaderComponent }: TradeOfferListProps) {
  const { data: offers, isLoading } = api.transaction.getTradeOffers.useQuery()
  const acceptTrade = api.transaction.acceptTradeOffer.useMutation({
    onSuccess: () => {
      Alert.alert("Trade offer accepted successfully!")
    },
    onError: (error) => {
      Alert.alert(error.message)
    },
  })

  const handleAccept = async (offerId: string) => {
    try {
      await acceptTrade.mutateAsync({ offerId })
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading...</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={offers}
      className="px-4"
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item: offer }) => (
        <View className="w-full max-w-sm rounded-lg bg-white p-4 shadow-md">
          {/* Name */}
          <View className="mb-2 flex-row items-center">
            <FontAwesome name="user" size={20} color="black" className="mr-2" />
            <Text className="text-base font-semibold">{offer.user?.fullName}</Text>
          </View>

          {/* Quantity */}
          <View className="mb-2 flex-row items-center">
            <MaterialIcons name="recycling" size={20} color="black" className="mr-2" />
            <Text className="text-base">Quantity: {offer.quantity}</Text>
          </View>

          {/* Location */}
          <View className="mb-2 flex-row items-center">
            <Entypo name="location" size={20} color="black" className="mr-2" />
            <Text className="text-base">Location: {offer.latitude || "N/A"}</Text>
          </View>

          {/* Status */}
          <View className="mb-4 flex-row items-center">
            <Ionicons name="cube" size={20} color="black" className="mr-2" />
            <Text className="text-base">Status: {offer.status}</Text>
          </View>

          {/* Buttons */}
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => console.log("Declined")}
              className="rounded-lg bg-red-500 px-4 py-2"
            >
              <Text className="font-semibold text-white">Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAccept(offer.id)}
              disabled={acceptTrade.isPending || offer.status !== "pending"}
              className={`rounded-lg px-4 py-2 ${
                offer.status === "pending" ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              <Text className="font-semibold text-white">
                {acceptTrade.isPending ? "Processing..." : "Accept"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  )
}
