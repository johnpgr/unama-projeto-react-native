import React, { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { useRouter } from "expo-router"
import { EvilIcons } from "@expo/vector-icons"
import { randomUserCode } from "node_modules/@projeto/api/src/database/schema"

import { notifications } from "~/app/(app)/points"
import { useSession } from "~/utils/auth"
import { getUserTransactions, useGetResponseLLM } from "~/utils/transaction"

interface Message {
  id: string
  text: string
  isUser: boolean
  options?: string[]
  choice?: string
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState("")
  const { getResponse, error, isPending } = useGetResponseLLM()
  const router = useRouter()
  const { data } = useSession()

  const requestMadeRef = useRef(false) // ref para rastrear requisições

  // Mensagem de boas-vindas com opções
  useEffect(() => {
    const botMessage: Message = {
      id: randomUserCode(3),
      text: "Olá! Eu sou o bot do Eco-Pontos! Eu sou responsável pelas suas finanças, o que você deseja saber sobre os seus pontos?",
      isUser: false,
    }
    const optionsMessage: Message = {
      id: randomUserCode(3),
      text: "Essas são algumas opções disponíveis para você:",
      isUser: true,
      options: [
        "Consultar saldo",
        "Ver transações",
        "Dúvidas sobre pontos",
        "Realizar uma previsão sobre meus pontos",
      ],
    }
    setMessages((prevMessages) => [botMessage, ...prevMessages])
    setMessages((prevMessages) => [optionsMessage, ...prevMessages])
  }, [])

  const sendMessageLastchance = async (input: string) => {
    try {
      const botResponse = await getResponse(input)
      if (botResponse) {
        const botMessage: Message = {
          id: Date.now().toString(),
          text: botResponse,
          isUser: false,
        }
        setMessages((prevMessages) => [botMessage, ...prevMessages])
      }
    } catch (err) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Error: ${err}`,
        isUser: false,
      }

      setMessages((prevMessages) => [errorMessage, ...prevMessages])
    }
  }

  const handleOptionClick = (option: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: `Você escolheu: ${option}`,
      choice: option.toUpperCase().replace(/\s+/g, ""),
      isUser: true,
    }

    setMessages((prevMessages) => [userMessage, ...prevMessages])
    requestMadeRef.current = false // Reset para novas requisições
  }

  // Efeito para lidar com a escolha do usuário
  useEffect(() => {
    const transactionDetails = notifications
      .map(
        (notification) =>
          `Transação de ${notification.points} pontos em ${notification.transactionDate ?? "data desconhecida"} de ${notification.from} para ${notification.to}.`,
      )
      .join("\n")

    if (!messages[0]?.choice || requestMadeRef.current)
      return console.log("caiu aqui =================") // Evitar chamadas repetidas

    if (messages[0]?.choice === "CONSULTARSALDO") {
      const botMessage: Message = {
        id: randomUserCode(3),
        text: `Seu saldo é de ${data.user?.totalPoints} pontos.`,
        isUser: false,
      }
      setMessages((prevMessages) => [botMessage, ...prevMessages])
    }

    if (messages[0]?.choice === "VERTRANSAÇÕES") {
      if (notifications.length <= 0) {
        const botMessage: Message = {
          id: randomUserCode(3),
          text: "Você não possui nenhuma transação salva em sua conta",
          isUser: false,
        }
        setMessages((prevMessages) => [botMessage, ...prevMessages])
      } else {
        const botMessage: Message = {
          id: randomUserCode(3),
          text: `Essas são todas as transações da sua conta:\n${transactionDetails}`,
          isUser: false,
        }
        setMessages((prevMessages) => [botMessage, ...prevMessages])
      }
    }

    if (messages[0]?.choice === "DÚVIDASSOBREPONTOS") {
      const botMessage: Message = {
        id: randomUserCode(3),
        text: `Você pode consultar seu saldo e ver todas as suas transações em sua conta.`,
        isUser: false,
      }
      setMessages((prevMessages) => [botMessage, ...prevMessages])
    }

    if (messages[0]?.choice === "REALIZARUMAPREVISÃOSOBREMEUSPONTOS") {
      if (notifications.length <= 4) {
        const botMessage: Message = {
          id: randomUserCode(3),
          text: `Você possue poucas transações, você só pode fazer uma previsão com, no mínimo, 5 transações na conta`,
          isUser: false,
        }
      } else {
        const prompt = `
    Você é um engenheiro de machine learning especializado em modelos de previsão financeira. Usando técnicas avançadas de regressão e análise de sequências temporais, faça uma previsão curta e objetiva sobre a quantidade de pontos que o usuário pode ganhar ou perder no próximo mês com base nas transações a seguir:
    
    ${transactionDetails}

    Nome do usuário: ${data.user?.fullName}

    Responda apenas no seguinte formato: 
    "Usando modelos sofisticados de regressão (machine learning), no próximo mês, seguindo a sua sequência, você {ganharia/perderia} {X} pontos."
  `
        sendMessageLastchance(prompt)
      }
    }

    requestMadeRef.current = true // Marcar que a requisição foi feita
  }, [messages[0]?.choice])

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      className={`mb-2 max-w-[80%] rounded-2xl p-3 ${
        item.isUser ? "self-end bg-gray-200" : "self-start bg-emerald-700"
      }`}
    >
      <Text className={item.isUser ? "text-black" : "text-white"}>
        {item.text}
      </Text>
      {item.options && (
        <View className="mt-2">
          {item.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleOptionClick(option)}
              className="mb-2 rounded-xl bg-white p-2"
            >
              <Text className="text-black">{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
        className="mb-10 flex-1 px-4"
        inverted
      />
    </View>
  )
}
