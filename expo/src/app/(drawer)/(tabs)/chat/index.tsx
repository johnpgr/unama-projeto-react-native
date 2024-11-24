/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React from "react"
import { FlatList, Text, TouchableOpacity, View } from "react-native"
import clsx from "clsx"

import { useAuth } from "~/hooks/auth"
import { api } from "~/utils/api"
import { formatDatePTBR } from "~/utils/date"
import { randomString } from "~/utils/random"

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
  const { data: userExtract } = api.user.getUserExtract.useQuery(undefined, {
    enabled: !!user,
  })
  const [messages, setMessages] = React.useState<Message[]>(initialMessages)
  const { mutateAsync: getLLMResponse } = api.chat.lookupTransactionsRegression.useMutation()

  async function requestPointsPrediction() {
    try {
      const msgResponse = await getLLMResponse()
      const msg = new BotMessage(msgResponse.content as string)

      setMessages((prevMessages) => [...prevMessages, msg])
    } catch (err) {
      if (err instanceof Error) {
        const msg = new BotMessage(err.message)

        setMessages((prevMessages) => [...prevMessages, msg])
      }
    }
  }

  async function handleOptionClick(option: UserMessageChoice) {
    const userMessage = new UserMessage(`Você escolheu: ${option}`)

    setMessages((prevMessages) => [userMessage, ...prevMessages])

    const notifications = Object.values(userExtract ?? {})
      .flat()
      .filter(Boolean)

    const transactionDetails = notifications
      .filter((notification) => notification.type === "p2pFrom" || notification.type === "p2pTo")
      .map(
        (notification) =>
          `Transação de ${notification.points} pontos em ${formatDatePTBR(notification.createdAt)} de ${notification.from} para ${notification.to}.`,
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

        await requestPointsPrediction()

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
    <View className="flex-1 flex-col gap-4 bg-background px-4 pt-4">
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
