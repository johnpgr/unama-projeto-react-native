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
import { SafeAreaView } from "react-native-safe-area-context"
import Checkbox from "expo-checkbox"
import { Link, Stack } from "expo-router"
import { Controller, useForm } from "react-hook-form"

import type { SignUpParams } from "~/utils/auth"
import { SigninOAuthButtons } from "~/components/buttons-signin-oauth"
import { useSignUp } from "~/utils/auth"

export default function SignUpScreen() {
    const [isAgreed, setIsAgreed] = React.useState(false)
    const { signUp, error, status } = useSignUp()
    const form = useForm<SignUpParams>({
        defaultValues: { email: "", fullName: "", password: "" },
    })

    async function onSubmit(data: SignUpParams) {
        if (!isAgreed) {
            return
        }
        await signUp(data)
    }

    return (
        <SafeAreaView>
            <Stack.Screen
                options={{
                    headerShown: false,
                    statusBarColor: "#02391E",
                    statusBarStyle: "light",
                }}
            />
            <KeyboardAvoidingView
                className="h-full w-full bg-primary"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                   <Image
                        source={require('../../assets/icon.png')}
                        style={{ width: 200, height: 200, alignSelf: 'center'}}
                    />
                <View className="mt-auto max-h-[540px] flex-1 rounded-t-[3rem] bg-white p-8">

                    <Text className="text-center text-4xl font-bold text-green-900">
                        Vamos começar
                    </Text>

                    <Text className="m-1 mt-4 text-lg">Nome</Text>
                    <Controller
                        name="fullName"
                        control={form.control}
                        render={({ field }) => (
                            <TextInput
                                className="rounded-xl border border-border px-4 py-2"
                                placeholder="Seu nome completo"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

                    <Text className="m-1 mt-5 text-lg">Email</Text>
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <TextInput
                                className="rounded-xl border border-border px-4 py-2"
                                placeholder="Seu melhor email"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

                    <Text className="m-1 mt-5 text-lg">Senha</Text>
                    <Controller
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <TextInput
                                secureTextEntry
                                className="rounded-xl border border-border px-4 py-2"
                                placeholder="Mínimo 8 caracteres"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

                    {error ? (
                        <Text className="mt-4 text-center text-red-500">
                            {error.message}
                        </Text>
                    ) : null}

                    <View className="flex flex-row items-center gap-2 py-4 mt-2">
                        <Checkbox
                            value={isAgreed}
                            onValueChange={(value) => setIsAgreed(value)}
                            color="#14542E"
                        />
                        <Text>
                            Eu concordo com o uso e processamento de{" "}
                            <Text className="font-medium text-green-900">
                                dados pessoais
                            </Text>
                        </Text>
                    </View>

                    <Pressable
                        className="relative flex flex-row items-center justify-center rounded-3xl bg-green-900 py-4 disabled:opacity-80"
                        onPress={form.handleSubmit(onSubmit)}
                        disabled={status === "pending" || status === "success"}
                    >
                        {status === "pending" ? (
                            <ActivityIndicator
                                className="absolute left-[35%]"
                                size="small"
                                color="#FFFFFF"
                            />
                        ) : null}
                        <Text className="text-xl font-bold text-white">
                            Criar conta
                        </Text>
                    </Pressable>

                    <SigninOAuthButtons />
                    <View className="flex flex-row items-center justify-center gap-2">
                        <Text>Já possui conta?</Text>
                        <Link
                            href="/signin"
                            className="font-medium text-green-900"
                        >
                            Entrar
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
