/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"
import { FlatList, Pressable, Text, TouchableOpacity, View } from "react-native"
import { useRouter } from "expo-router"
import { EvilIcons } from "@expo/vector-icons"
import clsx from "clsx"

import { useAuth } from "~/hooks/auth"
import { api } from "~/utils/api"
import { formatDatePTBR } from "~/utils/date"
import { randomString } from "~/utils/random"
import { PROMPT } from "./prompt"

const enum UserMessageChoice {
  REQUEST_BALANCE = "Consultar saldo",
  LIST_TRANSACTIONS = "Ver transações",
  DOUBT_ABOUT_POINTS = "Dúvidas sobre pontos",
  REQUEST_POINTS_PREDICTION = "Realizar uma previsão sobre meus pontos",
}

class BotMessage {
  public id: string = randomString(8)
  constructor(public text: string) {}
}

class UserMessage {
  public id: string = randomString(8)
  constructor(
    public text: string,
    public options?: UserMessageChoice[],
  ) {}
}

type Message = BotMessage | UserMessage

const choicesMessage = () =>
  new UserMessage("Essas são algumas opções disponíveis para você:", [
    UserMessageChoice.REQUEST_BALANCE,
    UserMessageChoice.LIST_TRANSACTIONS,
    UserMessageChoice.DOUBT_ABOUT_POINTS,
    UserMessageChoice.REQUEST_POINTS_PREDICTION,
  ])

const initialMessages: Message[] = [
  new BotMessage(
    "Olá! Eu sou o bot do Eco-Pontos! Eu sou responsável pelas suas finanças, o que você deseja saber sobre os seus pontos?",
  ),
  choicesMessage(),
]

export default function ChatbotScreen() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useAtom(notificationsAtom)
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const [inputText, setInputText] = React.useState("")
  const { mutateAsync: getResponse, data, isPending } = api.transaction.getLLMResponse.useMutation()
  const router = useRouter()

  if (!user) return null

  async function sendMessage(input: string) {
    try {
      const botResponse = await getResponse({ prompt: input })
      const responseMessage =
        typeof botResponse.response === "string"
          ? botResponse.response
          : botResponse.response.join(", ")

      const botMessage = new BotMessage(responseMessage)
      setMessages((prevMessages) => [...prevMessages, botMessage])
    } catch (err) {
      if (err instanceof Error) {
        const errorMessage = new BotMessage(`Erro: ${err.message}`)

        setMessages((prevMessages) => [...prevMessages, errorMessage])
      }
    }
  }

  async function handleOptionClick(option: UserMessageChoice) {
    const userMessage = new UserMessage(`Você escolheu: ${option}`)

    setMessages((prevMessages) => [userMessage, ...prevMessages])

    const transactionDetails = notifications
      .filter((notification) => notification.type === TransactionType.P2P)
      .map(
        (notification) =>
          `Transação de ${notification.points} pontos em ${formatDatePTBR(notification.transactionDate)} de ${notification.from} para ${notification.to}.`,
      )
      .join("\n")

    switch (option) {
      case UserMessageChoice.REQUEST_BALANCE: {
        const botMessage = new BotMessage(`Seu saldo é de ${user!.totalPoints} pontos.`)
        setMessages((prevMessages) => [botMessage, ...prevMessages])
        break
      }
      case UserMessageChoice.LIST_TRANSACTIONS: {
        if (notifications.length <= 0) {
          const botMessage = new BotMessage("Você não possui nenhuma transação salva em sua conta")
          setMessages((prevMessages) => [botMessage, ...prevMessages])
          break
        }

        const botMessage = new BotMessage(
          `Essas são todas as transações da sua conta:\n${transactionDetails}`,
        )
        setMessages((prevMessages) => [botMessage, ...prevMessages])
        break
      }
      case UserMessageChoice.DOUBT_ABOUT_POINTS: {
        const botMessage = new BotMessage(
          `Você pode consultar seu saldo e ver todas as suas transações em sua conta.`,
        )
        setMessages((prevMessages) => [botMessage, ...prevMessages])
        break
      }
      case UserMessageChoice.REQUEST_POINTS_PREDICTION: {
        if (notifications.length <= 4) {
          const botMessage = new BotMessage(
            `Você possue poucas transações, você só pode fazer uma previsão com, no mínimo, 5 transações na conta`,
          )
          setMessages((prevMessages) => [botMessage, ...prevMessages])
          break
        }
        const prompt = PROMPT(transactionDetails, user!.fullName)

        await sendMessage(prompt)
        break
      }
    }
    setMessages((prev) => [choicesMessage(), ...prev])
  }

  function renderMessage({ item }: { item: Message }) {
    return (
      <View
        className={clsx("mb-2 max-w-[80%] rounded-2xl p-3", {
          "self-end bg-gray-200": item instanceof UserMessage,
          "self-start bg-emerald-700": item instanceof BotMessage,
        })}
      >
        <Text className={item instanceof UserMessage ? "text-black" : "text-white"}>
          {item.text}
        </Text>
        {item instanceof UserMessage && item.options ? (
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
        ) : null}
      </View>
    )
  }

  return (
    <View className="mt-4 flex-1 flex-col gap-4 px-4">
      <View className="flex-row items-center justify-between">
        <Pressable onPress={() => router.back()}>
          <EvilIcons name="chevron-left" size={40} />
        </Pressable>

        <Pressable onPress={() => setMessages([])}>
          <EvilIcons name="trash" size={32} />
        </Pressable>
      </View>
      <FlatList
        className="mb-4"
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        inverted
      />
    </View>
  )
}
