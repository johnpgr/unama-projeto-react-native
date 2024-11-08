import React from "react"
import { KeyboardAvoidingView, Pressable, TextInput, View } from "react-native"
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated"
import { Feather } from "@expo/vector-icons"
import { useAtom } from "jotai"

import { searchAtom } from "~/state/search"

//TODO: Implement search functionality
export function Search() {
  const [isSearchOpen, setIsSearchOpen] = useAtom(searchAtom)
  const [search, setSearch] = React.useState("")

  if (!isSearchOpen) return null

  return (
    <KeyboardAvoidingView className="absolute top-7 z-10 w-full">
      <Animated.View
        className="flex w-full flex-row items-center gap-4 bg-white p-6"
        entering={FadeInUp.duration(100)}
        exiting={FadeOutUp.duration(100)}
      >
        <Pressable className="p-1" onPress={() => setIsSearchOpen(false)}>
          <Feather name="arrow-left" size={24} />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 rounded bg-zinc-200 px-2 py-1">
          <Feather name="search" size={16} />
          <TextInput
            value={search}
            onChangeText={(text) => setSearch(text)}
            placeholder="Buscar"
            className="flex-1"
          />
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}
