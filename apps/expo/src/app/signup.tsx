/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from "react"
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native"
import Checkbox from "expo-checkbox"
import { Link, Stack } from "expo-router"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"

import { signUpSchema } from "@projeto/validation"

import type { SignUpParams } from "~/hooks/auth"
import { SigninOAuthButtons } from "~/app/_components/SigninOAuthButtons"
import { useSignUp } from "~/hooks/auth"
import { useIsKeyboardOpen } from "~/hooks/keyboard"

export default function SignUpScreen() {
  const [isAgreed, setIsAgreed] = React.useState(false)
  const { signUp, error, isPending } = useSignUp()
  const form = useForm<SignUpParams>({
    resolver: zodResolver(signUpSchema),
    mode: "onSubmit",
    criteriaMode: "all",
  })
  const isKeyboardOpen = useIsKeyboardOpen()

  async function onSubmit(data: SignUpParams) {
    if (!isAgreed) {
      return
    }
    await signUp(data)
  }

  return (
    <KeyboardAvoidingView
      className="h-full w-full bg-primary"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{ statusBarColor: "#02391E", statusBarStyle: "light" }}
      />
      {isKeyboardOpen ? null : (
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 200, height: 200, alignSelf: "center" }}
        />
      )}
      <View className="mt-auto max-h-[630px] rounded-t-[3rem] bg-white p-8">
        <Text className="mt-4 text-center text-4xl font-bold text-green-900">
          Vamos começar
        </Text>

        <Controller
          name="fullName"
          control={form.control}
          render={({ field }) => (
            <View className="mt-4">
              <Text className="text-lg">Nome</Text>
              <TextInput
                className="rounded-xl border border-border px-4 py-2"
                placeholder="Seu nome completo"
                onChangeText={field.onChange}
                value={field.value}
                onBlur={field.onBlur}
              />
              {form.formState.errors.fullName ? (
                <Text className="text-destructive">
                  {form.formState.errors.fullName.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <View className="mt-4">
              <Text className="text-lg">Email</Text>
              <TextInput
                className="rounded-xl border border-border px-4 py-2"
                placeholder="Seu melhor email"
                onChangeText={field.onChange}
                value={field.value}
                onBlur={field.onBlur}
              />
              {form.formState.errors.email ? (
                <Text className="text-destructive">
                  {form.formState.errors.email.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        <Text className="m-1 mt-5 text-lg">Senha</Text>
        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <View>
              <TextInput
                secureTextEntry
                className="rounded-xl border border-border px-4 py-2"
                placeholder="Mínimo 8 caracteres"
                onChangeText={field.onChange}
                value={field.value}
                onBlur={field.onBlur}
              />
              {form.formState.errors.password ? (
                <Text className="text-destructive">
                  {form.formState.errors.password.message}
                </Text>
              ) : null}
            </View>
          )}
        />

        {error ? (
          <Text className="mt-4 text-center text-red-500">{error.message}</Text>
        ) : null}

        <View className="mt-2 flex flex-row items-center gap-2 py-4">
          <Checkbox
            value={isAgreed}
            onValueChange={(value) => setIsAgreed(value)}
            color="#14542E"
          />
          <Text>
            Eu concordo com o uso e processamento de{" "}
            <Text className="font-medium text-green-900">dados pessoais</Text>
          </Text>
        </View>

        <Pressable
          className="relative flex flex-row items-center justify-center rounded-3xl bg-green-900 py-4 disabled:opacity-80"
          onPress={form.handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator
              className="absolute left-[35%]"
              size="small"
              color="#FFFFFF"
            />
          ) : null}
          <Text className="text-xl font-bold text-white">Criar conta</Text>
        </Pressable>

        <SigninOAuthButtons />
        <View className="flex flex-row items-center justify-center gap-2">
          <Text>Já possui conta?</Text>
          <Link href="/signin" className="font-medium text-green-900">
            Entrar
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
