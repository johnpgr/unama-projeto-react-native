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

import { SignUpParams, useSignUp } from "~/utils/auth"

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
        <SafeAreaView className="flex-1">
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                className="flex flex-1"
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View className="mt-auto max-h-[500px] flex-1 rounded-t-[3rem] bg-white p-8">
                    <Text className="text-center text-4xl font-bold text-green-900">
                        Get started
                    </Text>

                    <Text className="m-1 mt-2 text-lg">Full Name:</Text>
                    <Controller
                        name="fullName"
                        control={form.control}
                        render={({ field }) => (
                            <TextInput
                                className="rounded-xl border border-green-900 px-4 py-2"
                                placeholder="Enter Full Name"
                                onChangeText={field.onChange}
                                value={field.value}
                                onBlur={field.onBlur}
                            />
                        )}
                    />

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

                    {error ? (
                        <Text className="mt-4 text-center text-red-500">
                            {error.message}
                        </Text>
                    ) : null}

                    <View className="flex flex-row items-center gap-2 py-4">
                        <Checkbox
                            value={isAgreed}
                            onValueChange={(value) => setIsAgreed(value)}
                            color="#14542E"
                        />
                        <Text>
                            I agree to the processing of{" "}
                            <Text className="font-medium text-green-900">
                                Personal data
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
                            Sign up
                        </Text>
                    </Pressable>


                    <View className="mt-4 flex flex-col items-center">
                        <Text>Sign up with:</Text>
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
                        <Text>Already have an account?</Text>
                        <Link
                            href="/signin"
                            className="font-medium text-green-900"
                        >
                            Sign in
                        </Link>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}
