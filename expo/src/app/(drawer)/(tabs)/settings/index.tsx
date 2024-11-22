/* eslint-disable @typescript-eslint/no-namespace */
import type { Href } from "expo-router"
import React from "react"
import { Pressable, Text, View } from "react-native"
import Dialog from "react-native-dialog"
import { Link } from "expo-router"
import { SimpleLineIcons } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"

import { useSignOut } from "~/hooks/auth"

const CONFIG_ITEMS: MenuItem.Props[] = [
  {
    type: "link",
    title: "Sua conta",
    description:
      "Veja informações sobre sua conta, seus dados, pontuação ou saiba mais sobre as opções de desativação de conta.",
    //@ts-expect-error for now ok
    href: "/settings/account",
    icon: <SimpleLineIcons name="user" size={24} />,
  },
  {
    type: "link",
    title: "Segurança e acesso à conta",
    description:
      "Acesse configurações de segurança, como verificação em duas etapas, ou altere sua senha.",
    //@ts-expect-error for now ok
    href: "/settings/security",
    icon: <SimpleLineIcons name="lock" size={24} />,
  },
  {
    type: "link",
    title: "Idioma e região",
    description: "Mude o idioma e a região de exibição do aplicativo.",
    //@ts-expect-error for now ok
    href: "/settings/locale",
    icon: <SimpleLineIcons name="globe" size={24} />,
  },
  {
    type: "link",
    title: "Notificações",
    description: "Configure as notificações do aplicativo.",
    //@ts-expect-error for now ok
    href: "/settings/notifications",
    icon: <SimpleLineIcons name="bell" size={24} />,
  },
  {
    type: "link",
    title: "Termos de Serviço",
    description: "Leia os termos de serviço do aplicativo.",
    //@ts-expect-error for now ok
    href: "/settings/terms",
    icon: <SimpleLineIcons name="book-open" size={24} />,
  },
  {
    type: "link",
    title: "Política de Privacidade",
    description: "Leia a política de privacidade do aplicativo.",
    //@ts-expect-error for now ok
    href: "/settings/privacy",
    icon: <SimpleLineIcons name="shield" size={24} />,
  },
  {
    type: "link",
    title: "Sobre",
    description: "Saiba mais sobre o aplicativo e a empresa.",
    //@ts-expect-error for now ok
    href: "/settings/about",
    icon: <SimpleLineIcons name="info" size={24} />,
  },
]

export function MenuItem(props: MenuItem.Props) {
  const Render = () =>
    props.type === "button" ? (
      <Pressable
        onPress={props.onPress}
        className="flex flex-row items-center justify-between gap-6 p-4 px-6"
      >
        {props.icon}
        <View className="flex flex-1 flex-col">
          {typeof props.title === "string" ? (
            <Text className="text-lg font-medium">{props.title}</Text>
          ) : (
            props.title
          )}
          {typeof props.description === "string" ? (
            <Text className="text-foreground/70">{props.description}</Text>
          ) : (
            props.description
          )}
        </View>
      </Pressable>
    ) : (
      <Link href={props.href} asChild>
        <Pressable className="flex flex-row items-center justify-between gap-6 p-4 px-6">
          {props.icon}
          <View className="flex flex-1 flex-col">
            {typeof props.title === "string" ? (
              <Text className="text-lg font-medium">{props.title}</Text>
            ) : (
              props.title
            )}
            {typeof props.description === "string" ? (
              <Text className="text-foreground/70">{props.description}</Text>
            ) : (
              props.description
            )}
          </View>
        </Pressable>
      </Link>
    )

  return (
    <>
      <Render />
      {props.index === CONFIG_ITEMS.length - 1 ? <LogoutItem /> : null}
    </>
  )
}

export namespace MenuItem {
  export type Props = LinkItem | ButtonItem

  export interface ButtonItem {
    type: "button"
    icon: React.ReactNode
    title: string | React.ReactNode
    description: string | React.ReactNode
    onPress: () => void
    index: number
  }

  export interface LinkItem {
    type: "link"
    icon: React.ReactNode
    title: string | React.ReactNode
    description: string | React.ReactNode
    href: Href
    index: number
  }
}

export function LogoutItem() {
  const [isVisible, setIsVisible] = React.useState(false)
  const { signOut } = useSignOut()

  function handleLogout() {
    void signOut()
    setIsVisible(false)
  }

  function handleCancel() {
    setIsVisible(false)
  }

  return (
    <>
      <Pressable
        onPress={() => setIsVisible(!isVisible)}
        className="flex flex-row items-center justify-between gap-6 p-4 px-6"
      >
        <SimpleLineIcons name="logout" size={24} />,
        <View className="flex flex-1 flex-col">
          <Text className="text-lg font-medium">Sair</Text>
          <Text className="text-foreground/70">Desconecte-se do aplicativo.</Text>
        </View>
      </Pressable>

      <Dialog.Container visible={isVisible}>
        <Dialog.Title>Sair</Dialog.Title>
        <Dialog.Description>Você tem certeza que deseja sair da sua conta?</Dialog.Description>
        <Dialog.Button label="Cancelar" onPress={handleCancel} />
        <Dialog.Button label="Sair" onPress={handleLogout} />
      </Dialog.Container>
    </>
  )
}

export default function ConfigScreen() {
  return (
    <View className="flex-1 bg-background">
      <FlashList
        data={CONFIG_ITEMS}
        estimatedItemSize={80}
        renderItem={({ item, index }) => <MenuItem {...item} index={index} />}
      />
    </View>
  )
}
