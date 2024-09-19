import Checkbox from "expo-checkbox"
import { Link, Stack } from "expo-router"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    Text,
    TextInput,
    View
} from "react-native"

import { SignInParams, useSignIn } from "~/utils/auth"

export default function SignUpScreen() {
    const [remember, setRemember] = React.useState(false)
    const form = useForm<SignInParams>({
        defaultValues: { email: "", password: "" },
    })
    const signIn = useSignIn()

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
                <View className="mt-auto max-h-[420px] flex-1 rounded-t-[3rem] bg-white p-8">
                    <Text className="text-center text-4xl font-bold text-green-900">
                        Welcome back
                    </Text>

                    <Text className="m-1 mt-2 text-lg">Email:</Text>
                    <Controller
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <TextInput
                                className="rounded-xl border border-green-900 px-4 py-2"
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
                                className="rounded-xl border border-green-900 px-4 py-2"
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
                        className="flex items-center rounded-3xl bg-green-900 py-4"
                        onPress={form.handleSubmit(onSubmit)}
                    >
                        <Text className="text-xl font-bold text-white">
                            Sign in
                        </Text>
                    </Pressable>

                    <View className="mt-4 flex flex-col items-center">
                        <Text>Sign in with:</Text>
                        <View className="flex flex-row gap-2">
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg",
                                }}
                            />
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_X_%28formerly_Twitter%29.svg",
                                }}
                            />
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg",
                                }}
                            />
                            <Image
                                source={{
                                    uri: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
                                }}
                            />
                        </View>
                    </View>

                    <View className="flex flex-row items-center justify-center gap-2 pt-4">
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
