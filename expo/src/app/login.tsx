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

import { LoginSchema } from "@projeto/api"

import type { LoginParams } from "../hooks/auth"
import { useLogin } from "../hooks/auth"
import { useIsKeyboardOpen } from "../hooks/keyboard"
import { SigninOAuthButtons } from "./_components/SigninOAuthButtons"

export default function SignUpScreen() {
  const [remember, setRemember] = React.useState(false)
  const { signIn, isPending, error } = useLogin()
  const form = useForm<LoginParams>({
    resolver: zodResolver(LoginSchema),
    mode: "onSubmit",
    criteriaMode: "all",
  })
  const isKeyboardOpen = useIsKeyboardOpen()

  async function onSubmit(data: LoginParams) {
    await signIn(data)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="h-full w-full bg-primary"
    >
      <Stack.Screen
        options={{
          statusBarBackgroundColor: "#02391E",
          statusBarStyle: "light",
        }}
      />
      {isKeyboardOpen ? null : (
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 200, height: 200, alignSelf: "center" }}
        />
      )}
      <View className="mt-auto flex max-h-[550px] rounded-t-[3rem] bg-white p-8">
        <Text className="mt-4 text-center text-4xl font-bold text-green-900">
          Bem-vindo de volta
        </Text>

        <Controller
          name="email"
          control={form.control}
          render={({ field }) => (
            <View className="mt-4">
              <Text className="text-lg">Email</Text>
              <TextInput
                className="rounded-xl border border-border px-4 py-2"
                placeholder="Seu email de acesso"
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

        <Controller
          control={form.control}
          name="password"
          render={({ field }) => (
            <View className="mt-4">
              <Text className="text-lg">Senha</Text>
              <TextInput
                secureTextEntry
                className="rounded-xl border border-border px-4 py-2"
                placeholder="Sua senha"
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

        <View className="mt-2 flex w-full flex-row items-center justify-between py-4">
          <View className="flex flex-row gap-2">
            <Checkbox
              value={remember}
              onValueChange={(value) => setRemember(value)}
              color="#14542E"
            />
            <Text>Lembrar de mim?</Text>
          </View>
          <Text className="font-medium text-green-900">
            Esqueceu sua senha?
          </Text>
        </View>

        <Pressable
          className="relative mt-4 flex flex-row items-center justify-center rounded-3xl bg-green-900 py-4 disabled:opacity-80"
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
          <Text className="text-xl font-bold text-white">Entrar</Text>
        </Pressable>

        {error ? (
          <Text className="mt-4 text-center text-destructive">
            {error.message}
          </Text>
        ) : null}

        <SigninOAuthButtons />
        <View className="flex flex-row items-center justify-center gap-2">
          <Text>Não possui uma conta?</Text>
          <Link href="/register" className="font-medium text-green-900">
            Crie uma
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  )
}
