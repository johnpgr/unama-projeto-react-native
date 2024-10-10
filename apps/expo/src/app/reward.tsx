import React, { useEffect, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { EvilIcons } from "@expo/vector-icons"

import { getUserTransactions, useGetResponseLLM } from "~/utils/transaction" // Ajuste o caminho conforme necessário

interface Message {
  id: string
  text: string
  isUser: boolean
}

const notifications = [
  {
    id: 1,
    points: 150,
    transactionDate: "2024-10-01",
    from: "João",
    to: "Você",
  },
  {
    id: 2,
    points: 200,
    transactionDate: "2024-10-03",
    from: "Maria",
    to: "Você",
  },
  {
    id: 3,
    points: 50,
    transactionDate: "2024-10-05",
    from: "Você",
    to: "Pedro",
  },
  // Adicione mais notificações conforme necessário
]
export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const { getResponse, error, isPending } = useGetResponseLLM()
  const router = useRouter()

  const sendMessage = async () => {
    if (inputText.trim() === "" || isPending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    }

    setMessages((prevMessages) => [userMessage, ...prevMessages])
    setInputText("")
    const transactionDetails = notifications
      .map(
        (notification) =>
          `Transação de ${notification.points} pontos em ${notification.transactionDate || "data desconhecida"} de ${notification.from} para ${notification.to}.`,
      )
      .join("\n")

    const prompt = `Você é um assistente de conta e deve dar informações sobre as transações do usuário. Sempre que possível, forneça informações curtas e objetivas. 
    \n\n${transactionDetails}\n\n
    Pergunta do usuário: ${inputText}`
    try {
      const botResponse = await getResponse(prompt)
      if (botResponse) {
        const botMessage: Message = {
          id: Date.now().toString(),
          text: botResponse,
          isUser: false,
        }
        setMessages((prevMessages) => [botMessage, ...prevMessages])
      }
    } catch (err) {
      console.error("Erro ao obter resposta:", err)
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Error: ${err}`,
        isUser: false,
      }
      setMessages((prevMessages) => [errorMessage, ...prevMessages])
    }
  }

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`mb-2 max-w-[80%] rounded-2xl p-3 ${
        item.isUser ? "self-end bg-blue-500" : "self-start bg-gray-200"
      }`}
    >
      <Text className={item.isUser ? "text-white" : "text-black"}>
        {item.text}
      </Text>
    </View>
  )
  return (
    <View className="flex-1 bg-gray-100">
      <View className="flex-row items-center justify-between p-4">
        <Pressable onPress={() => router.back()}>
          <EvilIcons name="chevron-left" size={40} />
        </Pressable>

        <Text className="text-lg font-bold">Chatbot</Text>
        <Pressable onPress={() => setMessages([])}>
          <EvilIcons name="trash" size={32} />
        </Pressable>
      </View>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4"
        inverted
      />
      <View className="flex-row items-center bg-white p-4">
        <TextInput
          className="mr-2 flex-1 rounded-full border border-gray-300 px-4 py-2"
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type a message..."
          onSubmitEditing={sendMessage}
          editable={!isPending}
        />
        <Pressable
          onPress={sendMessage}
          className="rounded-full bg-blue-500 p-2"
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="white" size="small" />
          ) : Platform.OS === "ios" ? (
            <EvilIcons name="arrow-up" size={24} color="white" />
          ) : (
            <EvilIcons name="arrow-right" size={24} color="white" />
          )}
        </Pressable>
      </View>
    </View>
  )
}
