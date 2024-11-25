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
import * as Location from "expo-location"
import { Entypo, FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons"
import { Picker } from "@react-native-picker/picker"
import { Controller, useForm } from "react-hook-form"

import { api } from "~/utils/api"

interface FormData {
  quantity: string
  itemType: ItemType
}

enum ItemType {
  PLASTIC_BOTTLE = "plastic",
  GLASS = "glass",
  METAL = "metal",
  PAPER = "paper",
  ELECTRONIC = "electronic",
}

export default function TradeOfferScreen() {
  const [shareLocation, setShareLocation] = useState(false)
  const [location, setLocation] = useState<Location.LocationObject | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>()
  const { mutateAsync: createTradeOffer, isPending } = api.tradeOffer.createTradeOffer.useMutation()

  async function onSubmit(data: FormData) {
    await createTradeOffer({
      quantity: Number(data.quantity),
      itemType: data.itemType,
      location:
        shareLocation && location
          ? {
              latitude: location.coords.latitude.toString(),
              longitude: location.coords.longitude.toString(),
            }
          : undefined,
    })
  }

  React.useEffect(() => {
    void (async () => {
      if (shareLocation) {
        const { granted } = await Location.requestForegroundPermissionsAsync()
        if (!granted) {
          setErrorMsg("Permissão para acessar localização negada")
          setShareLocation(false)
          return
        }

        const currentLocation = await Location.getCurrentPositionAsync({})
        setLocation(currentLocation)
      }
    })()
  }, [shareLocation])

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex flex-col gap-4">
        <View className="flex flex-col gap-2">
          <Text className="text-sm font-medium">Peso/Quantidade</Text>
          <Controller
            control={control}
            name="quantity"
            rules={{ required: true, min: 1 }}
            render={({ field: { onChange, value } }) => (
              <TextInput
                className="rounded-md border border-gray-300 p-4"
                keyboardType="numeric"
                onChangeText={onChange}
                value={value}
                placeholder="Insira a quantidade"
              />
            )}
          />
          {errors.quantity && (
            <Text className="mt-1 text-sm text-red-500">Por favor insira uma quantia válida</Text>
          )}
        </View>

        <View className="flex flex-col gap-2">
          <Text className="text-sm font-medium">Tipo</Text>
          <Controller
            control={control}
            name="itemType"
            rules={{ required: true }}
            render={({ field: { onChange, value } }) => (
              <View className="rounded-md border border-gray-300">
                <Picker selectedValue={value} onValueChange={onChange}>
                  <Picker.Item label="Garrafa Plástica" value={ItemType.PLASTIC_BOTTLE} />
                  <Picker.Item label="Papelão" value={ItemType.PAPER} />
                  <Picker.Item label="Vidro" value={ItemType.GLASS} />
                  <Picker.Item label="Alumínio" value={ItemType.METAL} />
                  <Picker.Item label="Eletrônico" value={ItemType.ELECTRONIC} />
                </Picker>
              </View>
            )}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-medium">Compartilhar minha localização</Text>
          <Switch value={shareLocation} onValueChange={setShareLocation} />
        </View>
        {errorMsg && <Text className="text-red-500">{errorMsg}</Text>}

        <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isPending} />
      </View>
    </ScrollView>
  )
}

interface TradeOfferListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ListHeaderComponent?: React.ComponentType<any>
}

export function TradeOfferList({ ListHeaderComponent }: TradeOfferListProps) {
  const { data: offers, isLoading } = api.tradeOffer.getTradeOffers.useQuery()
  const { mutateAsync: acceptTrade, isPending } = api.tradeOffer.acceptTradeOffer.useMutation({
    onSuccess: () => {
      Alert.alert("Oferta de troca aceita com sucesso!")
    },
    onError: (error) => {
      Alert.alert(error.message)
    },
  })

  const handleAccept = async (offerId: string) => {
    try {
      await acceptTrade({ offerId })
    } catch (error) {
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Carregando...</Text>
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
            <Text className="text-base">Quantidade: {offer.quantity}</Text>
          </View>

          {/* Location */}
          <View className="mb-2 flex-row items-center">
            <Entypo name="location" size={20} color="black" className="mr-2" />
            <Text className="text-base">Localização: {offer.latitude ?? "N/A"}</Text>
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
              <Text className="font-semibold text-white">Recusar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleAccept(offer.id)}
              disabled={isPending || offer.status !== "pending"}
              className={`rounded-lg px-4 py-2 ${
                offer.status === "pending" ? "bg-green-500" : "bg-gray-400"
              }`}
            >
              <Text className="font-semibold text-white">
                {isPending ? "Processando..." : "Aceitar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  )
}
