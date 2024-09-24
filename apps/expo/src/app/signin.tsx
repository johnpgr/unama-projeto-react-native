import React from "react"
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from "react-native"
import Checkbox from "expo-checkbox"
import { Link, Stack } from "expo-router"
import { Controller, useForm } from "react-hook-form"

import { SignInParams, useSignIn } from "~/utils/auth"

export default function SignUpScreen() {
    const [remember, setRemember] = React.useState(false)
    const form = useForm<SignInParams>({
        defaultValues: { email: "", password: "" },
    })
    const { signIn, error, status } = useSignIn()

    async function onSubmit(data: SignInParams) {
        await signIn(data)
    }

    return (
        <SafeAreaView className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex flex-1"
            >
                <View className="mt-auto max-h-[470px] flex-1 rounded-t-[3rem] bg-white p-8">
                    <Text className="text-center text-4xl font-bold text-green-900">
                        Welcome back
                    </Text>

                    <Text className="m-1 mt-2 text-lg">Email:</Text>
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <TextInput
                                className="rounded-xl border border-border px-4 py-2"
                                placeholder="Enter Email"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

                    <Text className="m-1 mt-2 text-lg">Password:</Text>
                    <Controller
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <TextInput
                                secureTextEntry
                                className="rounded-xl border border-border px-4 py-2"
                                placeholder="Enter Password"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

                    <View className="flex w-full flex-row items-center justify-between py-4">
                        <View className="flex flex-row gap-2">
                            <Checkbox
                                value={remember}
                                onValueChange={(value) => setRemember(value)}
                                color="#14542E"
                            />
                            <Text>Remember me?</Text>
                        </View>
                        <Text className="font-medium text-green-900">
                            Forgot password?
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
                            Sign in
                        </Text>
                    </Pressable>

                    {error ? (
                        <Text className="mt-4 text-center text-destructive">
                            {error.message}
                        </Text>
                    ) : null}

                    <View className="mt-4 flex flex-col items-center">
                        <Text>Sign in with:</Text>
                        <View className="py-4 flex flex-row gap-2">
                            <Pressable>
                                <Image source={require("../../assets/logo_google.png")} className="w-8 h-8"/>
                            </Pressable>
                            <Pressable>
                                <Image source={require("../../assets/logo_facebook.png")} className="w-8 h-8"/>
                            </Pressable>
                            <Pressable>
                                <Image source={require("../../assets/logo_apple.png")} className="w-8 h-8"/>
                            </Pressable>
                        </View>
                    </View>

                    <View className="flex flex-row items-center justify-center gap-2">
                        <Text>Don't have an account?</Text>
                        <Link
                            href="/signup"
                            className="font-medium text-green-900"
                        >
                            Sign up
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
